import { useRecoilState } from "recoil";
import { Community, communityState } from "../atoms/communitiesAtom";

const useCommunityData = () => {
  const [communityStateValue, setCommunityStatevalue] =
    useRecoilState(communityState);

  const onJoinOrLeave = (communityData: Community, isJoined: boolean) => {
    // is user signed in
    // if not -> open auth model

    if (isJoined) {
      leaveCommunity(communityData.id);
      return;
    }
    joinCommunity(communityData);
  };

  const joinCommunity = (communityData: Community) => {};

  const leaveCommunity = (communityId: string) => {};

  return {
    communityStateValue,
    onJoinOrLeave
  };
};

export default useCommunityData;
