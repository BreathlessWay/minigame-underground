import { Node, UITransform, Layers } from "cc";

export const createUINode = (name = "") => {
	const node = new Node(name),
		transform = node.addComponent(UITransform);

	transform.setAnchorPoint(0, 1);

	node.layer = 1 << Layers.nameToLayer("UI_2D"); // ???

	return node;
};
