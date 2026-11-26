
import { supabase } from "../js/supabase.js";

const loginForm = document.getElementById("loginForm");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const showPasswordButton = document.getElementById("showPassword");
const loginButton = document.getElementById("loginButton");
const loginMessage = document.getElementById("loginMessage");
const forgotPasswordLink = document.getElementById("forgotPassword");

document.getElementById("year").textContent = new Date().getFullYear();

// Show or hide password
showPasswordButton.addEventListener("click", () => {
  const isHidden = passwordInput.type === "password";

  passwordInput.type = isHidden ? "text" : "password";
  showPasswordButton.textContent = isHidden ? "Hide" : "Show";
});

// Display messages
function showMessage(message, type = "error") {
  loginMessage.textContent = message;
  loginMessage.className = `message ${type}`;
}

// Check whether a user is already signed in
async function checkExistingSession() {
  try {
    const { data, error } = await supabase.auth.getSession();

    if (error) throw error;

    if (data.session) {
      window.location.replace("dashboard/index.html");
    }
  } catch (error) {
    console.error("Session check failed:", error.message);
  }
}

checkExistingSession();

// Sign in
loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const email = emailInput.value.trim();
  const password = passwordInput.value;

  if (!email || !password) {
    showMessage("Please enter your email and password.");
    return;
  }

  loginButton.disabled = true;
  loginButton.textContent = "Signing in...";
  showMessage("");

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;

    if (!data.user) {
      throw new Error("Unable to verify your account.");
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .single();

    if (profileError) {
      await supabase.auth.signOut();
      throw new Error("Your user profile could not be verified.");
    }

    if (!["admin", "editor", "viewer"].includes(profile.role)) {
      await supabase.auth.signOut();
      throw new Error("You do not have permission to access the dashboard.");
    }

    showMessage("Login successful. Opening dashboard...", "success");

    window.location.replace("dashboard/index.html");

  } catch (error) {
    console.error("Login error:", error);
    showMessage(error.message || "Login failed. Please try again.");

    loginButton.disabled = false;
    loginButton.textContent = "Sign In";
  }
});

// Password reset
forgotPasswordLink.addEventListener("click", async (event) => {
  event.preventDefault();

  const email = emailInput.value.trim();

  if (!email) {
    showMessage("Enter your email address first to reset your password.");
    emailInput.focus();
    return;
  }

  showMessage("Sending password reset email...", "success");

  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/admin/reset-password.html`
    });

    if (error) throw error;

    showMessage("Password reset instructions have been sent to your email.", "success");

  } catch (error) {
    console.error("Password reset error:", error);
    showMessage(error.message || "Could not send the password reset email.");
  }
});
