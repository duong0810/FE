import ProfileActions from "./actions";
import FollowOA from "./follow-oa";
import UserAuth from "./UserAuth";

export default function ProfilePage() {
  return (
    <div className="min-h-full bg-section p-4 space-y-2.5">
      <UserAuth />
      <ProfileActions />
      <FollowOA />
    
    </div>
  );
}
