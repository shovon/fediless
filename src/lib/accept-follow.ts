import { actor } from "@/lib/constants";
import { send as sendActivity } from "@/lib/send-activity";

export async function acceptFollow(inbox: string, object: unknown) {
	// {
	//   "@context": "https://www.w3.org/ns/activitystreams",
	//   "id": "https://techhub.social/users/manlycoffee#accepts/follows/1129830",
	//   "type": "Accept",
	//   "actor": "https://techhub.social/users/manlycoffee",
	//   "object": {
	//     "id": "https://feditest.salrahman.com/activity/actors/johndoe/following/1",
	//     "type": "Follow",
	//     "actor": "https://feditest.salrahman.com/activity/actors/johndoe",
	//     "object": "https://techhub.social/users/manlycoffee"
	//   }
	// }

	const activity = {
		"@context": "https://www.w3.org/ns/activitystreams",
		id: `${actor}#accept/follow/${Date.now()}`,
		type: "Accept",
		actor,
		object,
	};

	await sendActivity(inbox, activity);
}
