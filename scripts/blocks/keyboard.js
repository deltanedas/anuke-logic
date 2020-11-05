const keyb = extendContent(MessageBlock, "keyboard", {
});

keyb.buildType = () => extendContent(MessageBlock.MessageBuild, keyb, {
	senseObject(type) {
		if (type == LAccess.config) {
			return new java.lang.String(this.message);
		}

		return this.super$senseObject(type);
	},

	// no
	handleString() {}
});
