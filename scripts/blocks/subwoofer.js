const woof = extend(Block, "subwoofer-speaker", {
	speed: 150
});

// Spare the lag of JavaAdapter on the server
if (!Vars.headless) {
	importPackage(Packages.arc.audio);

	woof.buildType = () => extend(Building, {
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
			if ((Time.millis() - this.played) < woof.speed) return;

			sound.at(this, Mathf.clamp(pitch, 0, 2));
			this.played = Time.millis();
		},

		played: 0
	});
}

module.exports = woof;
