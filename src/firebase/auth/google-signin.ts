// Version 1.0 Final Push
"use client";

import { Auth, GoogleAuthProvider, signInWithPopup, UserCredential } from "firebase/auth";
import { doc, getDoc, setDoc, Firestore } from "firebase/firestore";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";

const createGoogleUserProfile = async (credential: UserCredential, firestore: Firestore) => {
    const user = credential.user;
    const userRef = doc(firestore, 'users', user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
        const newUserProfile = {
            id: user.uid,
            name: user.displayName || 'Anonymous',
            email: user.email,
            role: 'student',
            joinDate: new Date().toISOString(),
            lastActive: new Date().toISOString(),
            banned: false,
        };

        setDoc(userRef, newUserProfile).catch((serverError) => {
            const permissionError = new FirestorePermissionError({
                path: userRef.path,
                operation: 'create',
                requestResourceData: newUserProfile,
            });
            errorEmitter.emit('permission-error', permissionError);
        });
    }
};


export function signInWithGoogle(auth: Auth, firestore: Firestore) {
  const provider = new GoogleAuthProvider();
  signInWithPopup(auth, provider)
    .then(credential => {
        createGoogleUserProfile(credential, firestore);
    })
    .catch((error) => {
        console.error("Google Sign-In Error:", error);
        // You can also use a toast notification to inform the user.
    });
}

    