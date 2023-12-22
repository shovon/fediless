import {
	actor as mainActorIri,
	post as postsUrlTemplate,
} from "@/lib/constants";

export function postObject(obj: {
	id: number;
	published: Date;
	senderID: string;
	content: string;
	recipientId: string;
}) {
	const activityObject = {
		"@context": "https://www.w3.org/ns/activitystreams",
		id: postsUrlTemplate.replace(":id", obj.id.toString()),
		type: "Note",
		published: obj.published.toISOString(),
		attributedTo: obj.senderID,
		content: obj.content,
		to: obj.recipientId,
	};
	return activityObject;
}
