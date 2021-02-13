try {
	const rtfm = require("rtfm/docs");

	rtfm.addPage("$anuke-logic", null, "$logic");

	/* Add a button for the anuke-logic manual inside the processor dialog */
	Events.on(ClientLoadEvent, () => {
		const icon = new TextureRegionDrawable(Core.atlas.find("god"));
		Vars.ui.logic.buttons.button(icon, () => {
			rtfm.showPage("$logic/$anuke-logic", true);
		}).size(64);
	});
	module.exports = true;
} catch (e) {
	if (!Vars.headless) {
		Log.warn("Please install [#00aaff]DeltaNedas/rtfm[] to view anuke-logic's manual pages.");
	}
	module.exports = false;
}
