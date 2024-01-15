import { firestore } from "../firebase";
import { doc, getDoc } from "firebase/firestore";

const getUserRole = async (userId) => {
  try {
    const userDoc = await getDoc(doc(firestore, "users", userId));
    if (userDoc.exists()) {
      return userDoc.data().role;
    } else {
      throw new Error("User document not found");
    }
  } catch (error) {
    console.error(error.message);
    return null;
  }
};

export default getUserRole;
