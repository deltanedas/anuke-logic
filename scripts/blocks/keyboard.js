const keyb = extendContent(MessageBlock, "keyboard", {
});

keyb.buildType = () => extendContent(MessageBlock.MessageBuild, keyb, {
	senseObject(type) {
		print("Sense kb " + type)
		if (type == LAccess.configure) return this.message;
		return this.super$senseObject(type);
	},

	// no
	handleString() {}
});
