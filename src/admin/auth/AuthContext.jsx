import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../lib/firebase";

const AuthContext = createContext(null);

/*
 * 관리자 여부는 Firestore admins/{uid} 문서가 있는지로 정한다.
 * 같은 기준을 보안 규칙과 미디어 Worker도 쓰므로, 여기서의 확인은 화면 안내용이다.
 */
async function isAdminUser(user) {
  try {
    const snapshot = await getDoc(doc(db, "admins", user.uid));
    return snapshot.exists();
  } catch {
    return false;
  }
}

function getLoginErrorMessage(error) {
  if (
    error.code === "auth/invalid-credential" ||
    error.code === "auth/wrong-password" ||
    error.code === "auth/user-not-found" ||
    error.code === "auth/invalid-email"
  ) {
    return "이메일 또는 비밀번호가 올바르지 않습니다.";
  }
  if (error.code === "auth/too-many-requests") {
    return "로그인 시도가 너무 많습니다. 잠시 후 다시 시도해 주세요.";
  }
  return error.message || "로그인 중 오류가 발생했습니다.";
}

export function AuthProvider({ children }) {
  const [status, setStatus] = useState(auth ? "loading" : "unconfigured");
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (!auth) return undefined;

    return onAuthStateChanged(auth, async (nextUser) => {
      if (!nextUser) {
        setUser(null);
        setStatus("signedOut");
        return;
      }

      const isAdmin = await isAdminUser(nextUser);
      if (!isAdmin) {
        await signOut(auth);
        return;
      }

      setUser(nextUser);
      setStatus("admin");
    });
  }, []);

  const value = useMemo(
    () => ({
      status,
      user,
      async login(email, password) {
        let credential;
        try {
          credential = await signInWithEmailAndPassword(auth, email, password);
        } catch (error) {
          throw new Error(getLoginErrorMessage(error));
        }

        if (!(await isAdminUser(credential.user))) {
          await signOut(auth);
          throw new Error("관리자 권한이 없는 계정입니다.");
        }
      },
      logout: () => signOut(auth),
    }),
    [status, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
