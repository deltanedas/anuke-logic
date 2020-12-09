const keyb = extend(MessageBlock, "keyboard", {
});

keyb.buildType = () => extend(MessageBlock.MessageBuild, keyb, {
	senseObject(type) {
		if (type == LAccess.config) {
			return new java.lang.String(this.message);
		}

		return this.super$senseObject(type);
	},

	// no
	handleString() {}
});

module.exports = keyb;
