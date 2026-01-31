const EmergencyPickup = require('../models/EmergencyPickup');
const Student = require('../models/Student');
const Guardian = require('../models/Guardian');
const BackupCircle = require('../models/BackupCircle');
const Notification = require('../models/Notification');
const User = require('../models/User');
const Message = require('../models/Message');
const Class = require('../models/Class');

// Timeout duration for each escalation level (in milliseconds)
const ESCALATION_TIMEOUT = 5 * 60 * 1000; // 5 minutes

/**
 * Emergency Pickup Service
 * Handles the complete emergency pickup flow from class cancellation to student pickup
 */
class EmergencyPickupService {
  
  /**
   * Initialize emergency pickup for a class
   * Called when teacher ends class early via chat bot
   */
  async initiateEmergencyPickup(messageId, classId, teacherId, reason, newPickupTime) {
    try {
      // Get class details
      const classInfo = await Class.findById(classId);
      if (!classInfo) {
        throw new Error('Class not found');
      }

      // Get all students in the class
      const students = await Student.find({ classId, isActive: true });
      if (students.length === 0) {
        throw new Error('No students found in this class');
      }

      // Create student pickup entries
      const studentPickups = students.map(student => ({
        studentId: student._id,
        status: 'pending',
        escalationLevel: 0,
        notificationHistory: []
      }));

      // Create emergency pickup record
      const emergencyPickup = await EmergencyPickup.create({
        messageId,
        classId,
        initiatedBy: teacherId,
        originalEndTime: new Date(), // Current time as original end
        newPickupTime: new Date(newPickupTime),
        reason,
        status: 'initiated',
        studentPickups
      });

      // Start notifying parents for each student
      const notificationResults = await this.notifyPrimaryGuardians(emergencyPickup);

      // Update status to in_progress
      emergencyPickup.status = 'in_progress';
      await emergencyPickup.save();

      return {
        emergencyPickupId: emergencyPickup._id,
        totalStudents: students.length,
        notificationsSent: notificationResults.sent,
        notificationsFailed: notificationResults.failed
      };
    } catch (error) {
      console.error('Error initiating emergency pickup:', error);
      throw error;
    }
  }

  /**
   * Notify all primary guardians for students in emergency pickup
   */
  async notifyPrimaryGuardians(emergencyPickup) {
    let sent = 0;
    let failed = 0;

    for (const studentPickup of emergencyPickup.studentPickups) {
      try {
        // Find primary guardian for this student
        const primaryGuardian = await Guardian.findOne({
          studentId: studentPickup.studentId,
          priority: 'primary',
          isActive: true
        }).populate('userId');

        if (primaryGuardian && primaryGuardian.userId) {
          // Get student details
          const student = await Student.findById(studentPickup.studentId);
          
          // Create notification
          const notification = await Notification.create({
            messageId: emergencyPickup.messageId,
            recipientId: primaryGuardian.userId._id,
            studentId: studentPickup.studentId,
            emergencyPickupId: emergencyPickup._id,
            notificationType: 'emergency_pickup',
            recipientRole: 'primary',
            title: '🚨 Emergency Pickup Required',
            body: `${student.name}'s class has ended early. Can you pick up your child?`,
            data: {
              emergencyPickupId: emergencyPickup._id.toString(),
              studentId: studentPickup.studentId.toString(),
              studentName: student.name,
              reason: emergencyPickup.reason,
              pickupTime: emergencyPickup.newPickupTime
            },
            timeoutAt: new Date(Date.now() + ESCALATION_TIMEOUT),
            pushToken: primaryGuardian.userId.pushToken
          });

          // Update student pickup status and history
          studentPickup.status = 'primary_notified';
          studentPickup.notificationHistory.push({
            notificationId: notification._id,
            recipientId: primaryGuardian.userId._id,
            recipientRole: 'primary',
            sentAt: new Date(),
            response: 'pending'
          });

          // Send push notification (in production, integrate with Expo Push Notifications)
          await this.sendPushNotification(primaryGuardian.userId.pushToken, notification);

          sent++;
        } else {
          // No primary guardian, escalate immediately to secondary
          await this.escalateToSecondary(emergencyPickup, studentPickup);
          failed++;
        }
      } catch (error) {
        console.error(`Error notifying primary guardian for student ${studentPickup.studentId}:`, error);
        failed++;
      }
    }

    await emergencyPickup.save();
    return { sent, failed };
  }

  /**
   * Handle guardian response to pickup request
   */
  async handlePickupResponse(emergencyPickupId, studentId, userId, response) {
    const emergencyPickup = await EmergencyPickup.findById(emergencyPickupId);
    if (!emergencyPickup) {
      throw new Error('Emergency pickup not found');
    }

    const studentPickup = emergencyPickup.studentPickups.find(
      sp => sp.studentId.toString() === studentId.toString()
    );
    if (!studentPickup) {
      throw new Error('Student not found in emergency pickup');
    }

    // Find the notification in history
    const notificationEntry = studentPickup.notificationHistory.find(
      nh => nh.recipientId.toString() === userId.toString() && nh.response === 'pending'
    );

    if (!notificationEntry) {
      throw new Error('No pending notification found for this user');
    }

    // Update notification response
    notificationEntry.response = response;
    notificationEntry.respondedAt = new Date();

    // Update the notification status in DB
    await Notification.findByIdAndUpdate(notificationEntry.notificationId, {
      status: 'read'
    });

    if (response === 'accepted') {
      // Pickup confirmed!
      return await this.confirmPickup(emergencyPickup, studentPickup, userId, notificationEntry.recipientRole);
    } else {
      // Declined - escalate to next level
      return await this.escalate(emergencyPickup, studentPickup);
    }
  }

  /**
   * Confirm pickup by a guardian
   */
  async confirmPickup(emergencyPickup, studentPickup, userId, role) {
    const user = await User.findById(userId);
    const student = await Student.findById(studentPickup.studentId);

    // Update student pickup status
    studentPickup.status = 'confirmed';
    studentPickup.confirmedBy = userId;
    studentPickup.confirmedByRole = role;
    studentPickup.confirmedAt = new Date();

    // Cancel any other pending notifications for this student
    await Notification.updateMany(
      {
        emergencyPickupId: emergencyPickup._id,
        studentId: studentPickup.studentId,
        status: { $in: ['sent', 'delivered'] }
      },
      { status: 'cancelled' }
    );

    // Mark other pending notifications as cancelled in history
    studentPickup.notificationHistory.forEach(nh => {
      if (nh.response === 'pending' && nh.recipientId.toString() !== userId.toString()) {
        nh.response = 'timeout';
      }
    });

    // If backup parent confirmed, notify the original parents
    if (role === 'backup') {
      await this.notifyOriginalParentsOfBackupPickup(emergencyPickup, studentPickup, user, student);
    }

    // Check if all students are confirmed
    await this.checkCompletion(emergencyPickup);

    await emergencyPickup.save();

    return {
      success: true,
      message: `Pickup confirmed by ${user.name} (${role})`,
      studentName: student.name,
      confirmedBy: {
        id: user._id,
        name: user.name,
        role
      }
    };
  }

  /**
   * Escalate to next level (secondary or backup circle)
   */
  async escalate(emergencyPickup, studentPickup) {
    const currentLevel = studentPickup.escalationLevel;

    if (currentLevel === 0) {
      // Escalate from primary to secondary
      return await this.escalateToSecondary(emergencyPickup, studentPickup);
    } else if (currentLevel === 1) {
      // Escalate from secondary to backup circle
      return await this.escalateToBackupCircle(emergencyPickup, studentPickup);
    } else {
      // All backup declined - emergency alert
      return await this.triggerEmergencyAlert(emergencyPickup, studentPickup);
    }
  }

  /**
   * Escalate to secondary guardian
   */
  async escalateToSecondary(emergencyPickup, studentPickup) {
    const secondaryGuardian = await Guardian.findOne({
      studentId: studentPickup.studentId,
      priority: 'secondary',
      isActive: true
    }).populate('userId');

    if (secondaryGuardian && secondaryGuardian.userId) {
      const student = await Student.findById(studentPickup.studentId);

      const notification = await Notification.create({
        messageId: emergencyPickup.messageId,
        recipientId: secondaryGuardian.userId._id,
        studentId: studentPickup.studentId,
        emergencyPickupId: emergencyPickup._id,
        notificationType: 'emergency_pickup',
        recipientRole: 'secondary',
        title: '🚨 Emergency Pickup - Primary Unavailable',
        body: `${student.name}'s primary guardian is unavailable. Can you pick up the child?`,
        data: {
          emergencyPickupId: emergencyPickup._id.toString(),
          studentId: studentPickup.studentId.toString(),
          studentName: student.name,
          reason: emergencyPickup.reason,
          pickupTime: emergencyPickup.newPickupTime,
          isEscalated: true
        },
        timeoutAt: new Date(Date.now() + ESCALATION_TIMEOUT),
        pushToken: secondaryGuardian.userId.pushToken
      });

      studentPickup.status = 'secondary_notified';
      studentPickup.escalationLevel = 1;
      studentPickup.notificationHistory.push({
        notificationId: notification._id,
        recipientId: secondaryGuardian.userId._id,
        recipientRole: 'secondary',
        sentAt: new Date(),
        response: 'pending'
      });

      await this.sendPushNotification(secondaryGuardian.userId.pushToken, notification);
      await emergencyPickup.save();

      return {
        success: true,
        message: 'Escalated to secondary guardian',
        level: 'secondary'
      };
    } else {
      // No secondary guardian, escalate to backup circle
      return await this.escalateToBackupCircle(emergencyPickup, studentPickup);
    }
  }

  /**
   * Escalate to backup circle (notify all backup contacts simultaneously)
   */
  async escalateToBackupCircle(emergencyPickup, studentPickup) {
    const backupCircle = await BackupCircle.find({
      studentId: studentPickup.studentId,
      isActive: true
    }).populate({
      path: 'guardianId',
      populate: { path: 'userId' }
    }).sort({ priorityOrder: 1 });

    if (backupCircle.length === 0) {
      // No backup circle configured
      return await this.triggerEmergencyAlert(emergencyPickup, studentPickup);
    }

    const student = await Student.findById(studentPickup.studentId);
    studentPickup.status = 'backup_notified';
    studentPickup.escalationLevel = 2;

    // Notify ALL backup contacts simultaneously
    for (const backup of backupCircle) {
      if (backup.guardianId && backup.guardianId.userId) {
        const notification = await Notification.create({
          messageId: emergencyPickup.messageId,
          recipientId: backup.guardianId.userId._id,
          studentId: studentPickup.studentId,
          emergencyPickupId: emergencyPickup._id,
          notificationType: 'backup_pickup_request',
          recipientRole: 'backup',
          title: '🆘 Backup Pickup Request',
          body: `Emergency! ${student.name} needs pickup. Both parents unavailable. Can you help?`,
          data: {
            emergencyPickupId: emergencyPickup._id.toString(),
            studentId: studentPickup.studentId.toString(),
            studentName: student.name,
            studentPhoto: student.profilePhoto,
            reason: emergencyPickup.reason,
            pickupTime: emergencyPickup.newPickupTime,
            isBackupRequest: true
          },
          timeoutAt: new Date(Date.now() + ESCALATION_TIMEOUT),
          pushToken: backup.guardianId.userId.pushToken
        });

        studentPickup.notificationHistory.push({
          notificationId: notification._id,
          recipientId: backup.guardianId.userId._id,
          recipientRole: 'backup',
          sentAt: new Date(),
          response: 'pending'
        });

        await this.sendPushNotification(backup.guardianId.userId.pushToken, notification);
      }
    }

    await emergencyPickup.save();

    return {
      success: true,
      message: `Escalated to backup circle (${backupCircle.length} contacts notified)`,
      level: 'backup',
      contactsNotified: backupCircle.length
    };
  }

  /**
   * Notify original parents when a backup parent confirms pickup
   */
  async notifyOriginalParentsOfBackupPickup(emergencyPickup, studentPickup, backupUser, student) {
    // Find primary and secondary guardians
    const guardians = await Guardian.find({
      studentId: studentPickup.studentId,
      priority: { $in: ['primary', 'secondary'] },
      isActive: true
    }).populate('userId');

    for (const guardian of guardians) {
      if (guardian.userId) {
        await Notification.create({
          messageId: emergencyPickup.messageId,
          recipientId: guardian.userId._id,
          studentId: studentPickup.studentId,
          emergencyPickupId: emergencyPickup._id,
          notificationType: 'pickup_assigned',
          recipientRole: guardian.priority,
          title: '✅ Backup Pickup Assigned',
          body: `${backupUser.name} from your backup circle will pick up ${student.name}`,
          data: {
            emergencyPickupId: emergencyPickup._id.toString(),
            studentId: studentPickup.studentId.toString(),
            studentName: student.name,
            pickupBy: {
              id: backupUser._id.toString(),
              name: backupUser.name,
              phone: backupUser.phone
            }
          },
          pushToken: guardian.userId.pushToken
        });

        await this.sendPushNotification(guardian.userId.pushToken, {
          title: '✅ Backup Pickup Assigned',
          body: `${backupUser.name} will pick up ${student.name}`
        });
      }
    }
  }

  /**
   * Trigger emergency alert when all guardians and backup decline
   */
  async triggerEmergencyAlert(emergencyPickup, studentPickup) {
    studentPickup.status = 'escalated';
    await emergencyPickup.save();

    // Notify teacher
    const teacher = await User.findById(emergencyPickup.initiatedBy);
    const student = await Student.findById(studentPickup.studentId);

    await Notification.create({
      messageId: emergencyPickup.messageId,
      recipientId: emergencyPickup.initiatedBy,
      studentId: studentPickup.studentId,
      emergencyPickupId: emergencyPickup._id,
      notificationType: 'emergency_pickup',
      recipientRole: 'teacher',
      title: '⚠️ URGENT: No Pickup Available',
      body: `No one available to pick up ${student.name}. Manual intervention required.`,
      data: {
        emergencyPickupId: emergencyPickup._id.toString(),
        studentId: studentPickup.studentId.toString(),
        studentName: student.name,
        requiresManualIntervention: true
      },
      pushToken: teacher.pushToken
    });

    // Also send final urgent notification to primary and secondary
    const guardians = await Guardian.find({
      studentId: studentPickup.studentId,
      priority: { $in: ['primary', 'secondary'] },
      isActive: true
    }).populate('userId');

    for (const guardian of guardians) {
      if (guardian.userId) {
        await Notification.create({
          messageId: emergencyPickup.messageId,
          recipientId: guardian.userId._id,
          studentId: studentPickup.studentId,
          emergencyPickupId: emergencyPickup._id,
          notificationType: 'emergency_pickup',
          recipientRole: guardian.priority,
          title: '⚠️ URGENT: Mandatory Pickup Alert',
          body: `${student.name} MUST be picked up. All backup contacts unavailable.`,
          data: {
            emergencyPickupId: emergencyPickup._id.toString(),
            studentId: studentPickup.studentId.toString(),
            studentName: student.name,
            isMandatory: true
          },
          pushToken: guardian.userId.pushToken
        });
      }
    }

    return {
      success: false,
      message: 'Emergency alert triggered - manual intervention required',
      level: 'emergency'
    };
  }

  /**
   * Check if all students have confirmed pickup and complete the event
   */
  async checkCompletion(emergencyPickup) {
    const allConfirmed = emergencyPickup.studentPickups.every(
      sp => sp.status === 'confirmed' || sp.status === 'picked_up'
    );

    if (allConfirmed) {
      emergencyPickup.status = 'completed';
      emergencyPickup.completedAt = new Date();

      // Notify teacher of completion
      await Notification.create({
        messageId: emergencyPickup.messageId,
        recipientId: emergencyPickup.initiatedBy,
        emergencyPickupId: emergencyPickup._id,
        notificationType: 'general',
        recipientRole: 'teacher',
        title: '✅ All Pickups Confirmed',
        body: 'All students have confirmed pickup arrangements.',
        data: {
          emergencyPickupId: emergencyPickup._id.toString(),
          completedAt: new Date()
        }
      });
    }
  }

  /**
   * Mark student as picked up (final confirmation)
   */
  async markAsPickedUp(emergencyPickupId, studentId) {
    const emergencyPickup = await EmergencyPickup.findById(emergencyPickupId);
    if (!emergencyPickup) {
      throw new Error('Emergency pickup not found');
    }

    const studentPickup = emergencyPickup.studentPickups.find(
      sp => sp.studentId.toString() === studentId.toString()
    );
    if (!studentPickup) {
      throw new Error('Student not found in emergency pickup');
    }

    studentPickup.status = 'picked_up';
    studentPickup.pickedUpAt = new Date();

    await this.checkCompletion(emergencyPickup);
    await emergencyPickup.save();

    return {
      success: true,
      message: 'Student marked as picked up'
    };
  }

  /**
   * Get emergency pickup status
   */
  async getEmergencyPickupStatus(emergencyPickupId) {
    const emergencyPickup = await EmergencyPickup.findById(emergencyPickupId)
      .populate('classId')
      .populate('initiatedBy', 'name email')
      .populate('studentPickups.studentId', 'name profilePhoto')
      .populate('studentPickups.confirmedBy', 'name phone');

    if (!emergencyPickup) {
      throw new Error('Emergency pickup not found');
    }

    return emergencyPickup;
  }

  /**
   * Get pending pickups for a user
   */
  async getPendingPickupsForUser(userId) {
    // 1. Fetch relevant notifications (Sent, Delivered OR Read)
    // We include 'read' to show items that the user has already responded to (accepted)
    const notifications = await Notification.find({
      recipientId: userId,
      notificationType: { $in: ['emergency_pickup', 'backup_pickup_request'] },
      status: { $in: ['sent', 'delivered', 'read'] }
    })
    .populate('studentId', 'name profilePhoto grade homeLocation')
    .populate({
      path: 'emergencyPickupId',
      populate: [
        { path: 'classId', select: 'name' },
        { path: 'initiatedBy', select: 'name' }
      ]
    })
    .sort({ sentAt: -1 });

    // 2. Transform and Filter
    return notifications.map(notification => {
      const pickup = notification.emergencyPickupId;
      if (!pickup) return null;

      // Find the user's response in history to determine acceptance
      // We need to look into studentPickups -> notificationHistory
      let userResponse = 'pending';
      let respondedAt = null;

      const studentPickup = pickup.studentPickups.find(
        sp => sp.studentId.toString() === notification.studentId._id.toString()
      );

      if (studentPickup) {
        const historyEntry = studentPickup.notificationHistory.find(
          nh => nh.notificationId.toString() === notification._id.toString()
        );
        if (historyEntry) {
          userResponse = historyEntry.response;
          respondedAt = historyEntry.respondedAt;
        }
      }

      // Filter: Only return if it's pending OR if it's accepted by this user
      if (userResponse === 'declined' || userResponse === 'timeout') {
         // Optionally you could return these too if you want to show "Declined" history
         // For now, let's skip them to keep the list clean, or return them with a specific flag
         return null; 
      }
      
      // If the pickup is fully completed/closed, we might want to hide it
      // if (pickup.status === 'completed') return null;

      return {
        _id: notification._id,
        emergencyPickupId: pickup._id,
        studentId: notification.studentId,
        classId: pickup.classId,
        reason: pickup.reason,
        newPickupTime: pickup.newPickupTime,
        recipientRole: notification.recipientRole,
        status: notification.status,
        userResponse: userResponse, // 'pending', 'accepted', 'declined'
        teacherName: pickup.initiatedBy ? pickup.initiatedBy.name : 'Unknown Teacher',
        createdAt: notification.createdAt
      };
    }).filter(item => item !== null);
  }

  /**
   * Send push notification (placeholder - integrate with Expo Push Notification service)
   */
  async sendPushNotification(token, notification) {
    if (!token) {
      console.log('No push token available, skipping push notification');
      return;
    }

    // In production, integrate with Expo Push Notification Service
    // Example:
    // const message = {
    //   to: token,
    //   sound: 'default',
    //   title: notification.title,
    //   body: notification.body,
    //   data: notification.data,
    // };
    // await fetch('https://exp.host/--/api/v2/push/send', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify(message),
    // });

    console.log('Push notification sent:', {
      token: token?.substring(0, 20) + '...',
      title: notification.title,
      body: notification.body
    });
  }

  /**
   * Process timeout escalations (called by cron job)
   */
  async processTimeoutEscalations() {
    const now = new Date();

    // Find timed out notifications
    const timedOutNotifications = await Notification.find({
      notificationType: { $in: ['emergency_pickup', 'backup_pickup_request'] },
      status: { $in: ['sent', 'delivered'] },
      timeoutAt: { $lte: now }
    });

    for (const notification of timedOutNotifications) {
      try {
        // Update notification status
        notification.status = 'timeout';
        await notification.save();

        // Get emergency pickup
        const emergencyPickup = await EmergencyPickup.findById(notification.emergencyPickupId);
        if (!emergencyPickup) continue;

        const studentPickup = emergencyPickup.studentPickups.find(
          sp => sp.studentId.toString() === notification.studentId?.toString()
        );
        if (!studentPickup || studentPickup.status === 'confirmed' || studentPickup.status === 'picked_up') continue;

        // Update notification history
        const notificationEntry = studentPickup.notificationHistory.find(
          nh => nh.notificationId.toString() === notification._id.toString()
        );
        if (notificationEntry) {
          notificationEntry.response = 'timeout';
          notificationEntry.respondedAt = now;
        }

        // Escalate
        await this.escalate(emergencyPickup, studentPickup);
      } catch (error) {
        console.error('Error processing timeout escalation:', error);
      }
    }
  }
}

module.exports = new EmergencyPickupService();
