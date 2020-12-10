const speaker = extend(Block, "speaker", {
	speed: 500
});

// Spare the lag of JavaAdapter on the server
if (!Vars.headless) {
	importPackage(Packages.arc.audio);

	speaker.buildType = () => extend(Building, {
		getSound(name) {
			try {
				return Sounds[name] instanceof Sound ? Sounds[name] : null;
			} catch (e) {
				// Sound doesnt exist as a field or function
				return null;
			}
		},

		playSound(sound, pitch) {
			// anti-spam
			if ((Time.millis() - this.played) < speaker.speed) return;

			sound.at(this);
			this.played = Time.millis();
		},

		played: 0
	});
}

module.exports = speaker;
