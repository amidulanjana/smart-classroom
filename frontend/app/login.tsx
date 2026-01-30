import { Colors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";

type UserRole = "teacher" | "parent";

export default function LoginScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const router = useRouter();

  const [selectedRole, setSelectedRole] = useState<UserRole>("teacher");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = () => {
    console.log("Login pressed", { selectedRole, email });
    // Navigate to appropriate portal based on selected role
    if (selectedRole === "teacher") {
      router.replace("/(tabs)/home");
    } else {
      router.replace("/(tabs)/parent");
    }
  };

  const handleGoogleSignIn = () => {
    console.log("Google sign in pressed");
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View style={styles.header}>
          <View
            style={[styles.logoContainer, { backgroundColor: colors.primary }]}
          >
            <Ionicons name="school" size={40} color="white" />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>
            SchoolConnect
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Connecting School & Home
          </Text>
        </View>

        {/* Role Selection */}
        <View style={styles.roleSection}>
          <View style={styles.roleButtons}>
            {/* Teacher Button */}
            <TouchableOpacity
              style={[
                styles.roleButton,
                { backgroundColor: colors.surface, borderColor: colors.border },
                selectedRole === "teacher" && {
                  borderColor: colors.primary,
                  backgroundColor: `${colors.primary}0D`,
                },
              ]}
              onPress={() => setSelectedRole("teacher")}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.roleIcon,
                  { backgroundColor: colors.blueLight },
                  selectedRole === "teacher" && {
                    backgroundColor: colors.primary,
                  },
                ]}
              >
                <Ionicons
                  name="school-outline"
                  size={24}
                  color={selectedRole === "teacher" ? "white" : colors.primary}
                />
              </View>
              <Text
                style={[
                  styles.roleText,
                  { color: colors.text },
                  selectedRole === "teacher" && { color: colors.primary },
                ]}
              >
                I am a Teacher
              </Text>
              {selectedRole === "teacher" && (
                <View
                  style={[
                    styles.checkBadge,
                    { backgroundColor: colors.primary },
                  ]}
                >
                  <Ionicons name="checkmark" size={12} color="white" />
                </View>
              )}
            </TouchableOpacity>

            {/* Parent Button */}
            <TouchableOpacity
              style={[
                styles.roleButton,
                { backgroundColor: colors.surface, borderColor: colors.border },
                selectedRole === "parent" && {
                  borderColor: colors.primary,
                  backgroundColor: `${colors.primary}0D`,
                },
              ]}
              onPress={() => setSelectedRole("parent")}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.roleIcon,
                  { backgroundColor: colors.orangeLight },
                  selectedRole === "parent" && {
                    backgroundColor: colors.primary,
                  },
                ]}
              >
                <Ionicons
                  name="people-outline"
                  size={24}
                  color={selectedRole === "parent" ? "white" : colors.orange}
                />
              </View>
              <Text
                style={[
                  styles.roleText,
                  { color: colors.text },
                  selectedRole === "parent" && { color: colors.primary },
                ]}
              >
                I am a Parent
              </Text>
              {selectedRole === "parent" && (
                <View
                  style={[
                    styles.checkBadge,
                    { backgroundColor: colors.primary },
                  ]}
                >
                  <Ionicons name="checkmark" size={12} color="white" />
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Login Form */}
        <View style={styles.formSection}>
          {/* Email Field */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>
              Email Address
            </Text>
            <View
              style={[
                styles.inputContainer,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              <Ionicons
                name="mail-outline"
                size={20}
                color={colors.textSecondary}
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="name@example.com"
                placeholderTextColor={colors.textSecondary}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
            </View>
          </View>

          {/* Password Field */}
          <View style={styles.inputGroup}>
            <View style={styles.passwordHeader}>
              <Text style={[styles.label, { color: colors.text }]}>
                Password
              </Text>
              <TouchableOpacity>
                <Text
                  style={[styles.forgotPassword, { color: colors.primary }]}
                >
                  Forgot Password?
                </Text>
              </TouchableOpacity>
            </View>
            <View
              style={[
                styles.inputContainer,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color={colors.textSecondary}
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="••••••••"
                placeholderTextColor={colors.textSecondary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoComplete="password"
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
              >
                <Ionicons
                  name={showPassword ? "eye-outline" : "eye-off-outline"}
                  size={20}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Login Button */}
          <TouchableOpacity
            style={[styles.loginButton, { backgroundColor: colors.primary }]}
            onPress={handleLogin}
            activeOpacity={0.8}
          >
            <Text style={styles.loginButtonText}>Log In</Text>
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.divider}>
            <View
              style={[styles.dividerLine, { backgroundColor: colors.border }]}
            />
            <Text
              style={[
                styles.dividerText,
                {
                  color: colors.textSecondary,
                  backgroundColor: colors.background,
                },
              ]}
            >
              Or continue with
            </Text>
            <View
              style={[styles.dividerLine, { backgroundColor: colors.border }]}
            />
          </View>

          {/* Google Sign In */}
          <TouchableOpacity
            style={[
              styles.googleButton,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
            onPress={handleGoogleSignIn}
            activeOpacity={0.8}
          >
            <Ionicons name="logo-google" size={20} color={colors.red} />
            <Text style={[styles.googleButtonText, { color: colors.text }]}>
              Sign in with Google
            </Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>
            New to SchoolConnect?{" "}
            <Text style={[styles.footerLink, { color: colors.primary }]}>
              Create an account
            </Text>
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 24,
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
  },
  logoContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: "500",
  },
  roleSection: {
    marginBottom: 24,
  },
  roleButtons: {
    flexDirection: "row",
    gap: 16,
  },
  roleButton: {
    flex: 1,
    height: 128,
    borderRadius: 12,
    borderWidth: 2,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  roleIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  roleText: {
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
  },
  checkBadge: {
    position: "absolute",
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  formSection: {
    gap: 20,
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 4,
  },
  passwordHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  forgotPassword: {
    fontSize: 12,
    fontWeight: "500",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    height: 56,
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 14,
    height: "100%",
  },
  eyeIcon: {
    padding: 4,
  },
  loginButton: {
    height: 56,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  loginButtonText: {
    color: Colors.light.white,
    fontSize: 16,
    fontWeight: "bold",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 8,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: 14,
    paddingHorizontal: 16,
  },
  googleButton: {
    height: 56,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  googleButtonText: {
    fontSize: 15,
    fontWeight: "500",
  },
  footer: {
    alignItems: "center",
    marginTop: 32,
  },
  footerText: {
    fontSize: 14,
  },
  footerLink: {
    fontWeight: "600",
  },
});
