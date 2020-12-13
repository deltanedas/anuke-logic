const anuke = global.anuke = {
	/* Mimic @RegisterStatement */
	register(name, statement, def) {
		LAssembler.customParsers.put(name, func(statement.new));

		LogicIO.allStatements.add(prov(() => statement.new(def)));
	}
};

const add = (type, names) => {
	for (var i in names) {
		var name = names[i];
		try {
			anuke[name] = require("anuke-logic/" + type + "/" + name);
		} catch (e) {
			Log.err("Failed to load anuke-logic script @/@.js: @ (@#@)",
				type, name, e, e.fileName,
				new java.lang.Integer(e.lineNumber));
			anuke[name] = null;
		}
	}
};


/* Instructions */
add("inst", ["unbind", "string", "reflect", "proc", "drawx", "sound", "rotate"]);

/* Blocks */
add("blocks", ["7seg-display", "char-display", "keyboard",
	"unit-detector", "speaker", "subwoofer"]);

/* Units */
add("units", ["messenger"]);

/* Misc */
add("misc", ["manual"]);
