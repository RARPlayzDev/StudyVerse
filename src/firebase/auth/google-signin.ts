"use client";

import { Auth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

export function signInWithGoogle(auth: Auth) {
  const provider = new GoogleAuthProvider();
  signInWithPopup(auth, provider).catch((error) => {
    console.error("Google Sign-In Error:", error);
    // You can also use a toast notification to inform the user.
  });
}
