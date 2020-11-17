// Unbinds a unit with no delay.

const UnbindI = {
	run(vm) {
		const unit = vm.obj(LExecutor.varUnit);
		if (!unit) return;

		unit.resetController();
		vm.setobj(LExecutor.varUnit, null);
	}
};

const UnbindStatement = {
	new: () => extend(LStatement, Object.create(UnbindStatement)),

	read(words) {
	},

	build(h) {
		if (h instanceof Table) {
			return;
		}

		return extend(LExecutor.LInstruction, Object.create(UnbindI));
	},

	write(b) {
		b.append("unbind");
	},

	name: () => "Unbind",
	color: () => Pal.logicUnits
};

/* Mimic @RegisterStatement */
LAssembler.customParsers.put("unbind", func(UnbindStatement.new));

LogicIO.allStatements.add(prov(UnbindStatement.new));

module.exports = UnbindStatement;
