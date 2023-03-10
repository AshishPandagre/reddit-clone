import {
  collection,
  doc,
  getDocs,
  increment,
  writeBatch,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useRecoilState, useSetRecoilState } from "recoil";
import { authModalState } from "../atoms/authModalAtom";
import {
  Community,
  CommunitySnippet,
  communityState,
} from "../atoms/communitiesAtom";
import { auth, firestore } from "../firebase/clientApp";

const useCommunityData = () => {
  const [user] = useAuthState(auth);
  const setAuthModalState = useSetRecoilState(authModalState);
  const [communityStateValue, setCommunityStatevalue] =
    useRecoilState(communityState);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onJoinOrLeave = (communityData: Community, isJoined: boolean) => {
    // is user signed in
    // if not -> open auth model

    if (!user)
      return setAuthModalState({
        open: true,
        view: "login",
      });

    if (isJoined) {
      leaveCommunity(communityData.id);
      return;
    }
    joinCommunity(communityData);
  };

  const getMySnippets = async () => {
    try {
      // get user snippet
      const snippetDocs = await getDocs(
        collection(firestore, `users/${user?.uid}/communitySnippets`)
      );
      const snippets = snippetDocs.docs.map((doc) => ({ ...doc.data() }));
      setCommunityStatevalue((prev) => ({
        ...prev,
        mySnippets: snippets as CommunitySnippet[],
      }));
    } catch (err) {
      console.log(err);
    }
    setLoading(false);
  };

  const joinCommunity = async (communityData: Community) => {
    // below are the 2 batch writes:
    // creating a new community snipper for the user.
    // updating the number of members on the community document.

    setLoading(true);

    try {
      const batch = writeBatch(firestore);
      const newSnippet: CommunitySnippet = {
        communityId: communityData.id,
        imageUrl: communityData.imageUrl || "",
      };

      batch.set(
        doc(
          firestore,
          `users/${user?.uid}/communitySnippets`,
          communityData.id
        ),
        newSnippet
      );

      batch.update(doc(firestore, "communities", communityData.id), {
        numberOfMembers: increment(1),
      });

      await batch.commit();

      setCommunityStatevalue((prev) => ({
        ...prev,
        mySnippets: [...prev.mySnippets, newSnippet],
      }));
    } catch (err: any) {
      console.log("joinCommunity error: ", error);
      setError(err.message);
    }

    setLoading(false);
  };

  const leaveCommunity = async (communityId: string) => {
    // below are the 2 batch writes:
    // deleting community snipper for the user.
    // updating the number of members on the community document.

    setLoading(true);

    try {
      const batch = writeBatch(firestore);

      batch.delete(
        doc(firestore, `users/${user?.uid}/communitySnippets`, communityId)
      );

      batch.update(doc(firestore, "communities", communityId), {
        numberOfMembers: increment(-1),
      });

      await batch.commit();

      setCommunityStatevalue((prev) => ({
        ...prev,
        mySnippets: prev.mySnippets.filter(
          (item) => item.communityId != communityId
        ),
      }));
    } catch (err: any) {
      console.log("leaveCommunity error : ", err);
      setError(err.message);
    }

    setLoading(false);
  };

  useEffect(() => {
    if (!user) return;
    getMySnippets();
  }, [user]);

  return {
    communityStateValue,
    onJoinOrLeave,
    loading,
  };
};

export default useCommunityData;
