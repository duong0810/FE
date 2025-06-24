import ProfileActions from "./actions";
import FollowOA from "./follow-oa";
import Register from "./Register";

export default function ProfilePage() {
  return (
    <div className="min-h-full bg-section p-4 space-y-2.5">
      <Register />
      <ProfileActions />
      <FollowOA />
    
    </div>
  );
}
