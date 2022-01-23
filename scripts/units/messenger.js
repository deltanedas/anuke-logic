/* Old v5 javelin repurposed as a logic-only unit. */

const mess = extend(UnitType, "messenger", {
	load() {
		this.super$load();
		this.shieldRegion = Core.atlas.find(this.name + "-shield");
	},

	draw(unit) {
		const z = Layer.flyingUnit;
		if (unit.controller.isBeingControlled(Vars.player.unit())) {
			this.drawControl(unit);
		}

		// Get longer and thinner the faster it goes
		Draw.yscl = unit.warp();
		Draw.xscl = 1 / Math.sqrt(Draw.yscl);

		Draw.z(Math.min(Layer.darkness, z - 1));
		// Elevation is used for boost stuff
		const elevation = unit.elevation;
		unit.elevation = 1;
		this.drawShadow(unit);
		unit.elevation = elevation;

		Draw.z(Math.min(z - 0.02, Layer.bullet - 1));
		this.drawSoftShadow(unit);

		Draw.z(z - 0.01f);
		Draw.rect(this.outlineRegion, unit.x, unit.y, unit.rotation - 90);

		Draw.z(z);
		Draw.yscl = unit.warp();
		Draw.xscl = 1 / Math.sqrt(Draw.yscl);
		this.drawEngine(unit);
		Draw.rect(this.region, unit.x, unit.y, unit.rotation - 90);
		this.super$drawCell(unit);
		Draw.yscl = unit.warp();
		Draw.xscl = 1 / Math.sqrt(Draw.yscl);
		this.super$drawItems(unit);
		// Special case = photonic boom
		Draw.yscl = Math.pow(unit.warp(), 10);
		Draw.xscl = 1 / Math.sqrt(Draw.yscl);
		this.drawLight(unit);
		if (unit.shieldAlpha > 0.01) this.drawShield(unit);

		Draw.yscl = unit.warp();
		Draw.xscl = 1 / Math.sqrt(Draw.yscl);
		for (var i = 0; i < this.abilities.size; i++) {
			this.abilities.get(i).draw(unit);
		}

		Draw.xscl = 1;
		Draw.yscl = 1;
	},

	// Create super$ funcs that can be used, on its own theyre booleans
	drawCell() {}, drawItems() {},

	classId: -1,
	speed: 1.87,
	drag: 0.01,
	health: 170,
	flying: true,
	canBoost: true,
	itemCapacity: 200,
	rotateSpeed: 0.1
});

Blocks.airFactory.plans.add(new UnitFactory.UnitPlan(mess, 25 * 60,
	ItemStack.with(Items.silicon, 30, Items.titanium, 20)));

// Disable AI
mess.defaultController = () => extend(AIController, {
	updateUnit() {}
});

mess.constructor = () => extend(UnitEntity, {
	isGrounded() {
		return this.dead && this.super$isGrounded();
	},

	setStats() {
		this.super$setStats();
		this.stats.add(Stat.canBoost, true);
	},

	speed() {
		if (this.isBoosting()) {
			return this.power > 0.03 ? (this.power < 0.95 ? 0.5 + this.power : (this.power + 1) * 15) : mess.speed;
		}
		return this.super$speed();
	},

	damage(amount, withEffect) {
		if (withEffect === undefined) {
			this.super$damage(amount);
		} else {
			this.super$damage(amount, withEffect);
		}

		/* Kill engines when hit */
		this.power = 0;
		this.vel.setZero();
	},

	// Fix reading from net or saves
	classId: () => mess.classId,

	// Translated from zenith mass
	mass: () => 502,

	warp() {
		return this.isBoosting() ? Mathf.clamp(this.vel.len(), 1, (this.power + 1) * 5) : 1;
	},
	isBoosting() {
		const ctrl = this.controller;
		return this.isPlayer() ? ctrl.boosting : ctrl.boost;
	},

	read(read) {
		this.super$read(read);
		this.power = read.f();
	},
	write(write) {
		this.super$write(write);
		write.f(this.power);
	},

	getPower() {return this._power},
	setPower(set) {this._power = set},
	_power: 0
});

function newAbility(name, def) {
	def.localized = () => Core.bundle.get("ability.anuke-logic-" + name);
	mess.abilities.add(extend(Ability, def));
}

newAbility("jump-drive", {
	update(unit) {
		// Legacy saves
		if (unit.classId() != mess.classId) {
			const newu = mess.create(unit.team);
			newu.set(unit);
			newu.add();
			unit.kill(); unit.remove();
			return;
		}

		if (unit.isBoosting()) {
			unit.power = Mathf.lerp(unit.power, 1, 0.02);
			if (Vars.ui && Mathf.chance(unit.power / 15)) {
				Fx.lancerLaserCharge.at(unit);
			}
		} else {
			// Cut the engines immediately
			if (unit.power > 0.95) unit.power = 0.95;
			unit.power = Mathf.lerp(unit.power, 0, 0.05);
		}
	}
});

newAbility("sparking", {
	update(unit) {
		const scl = unit.power;
		if (!Mathf.chance(Time.delta * 0.15 * scl)) return;

		if (Vars.ui) Fx.hitLancer.at(unit);
		Lightning.create(unit.team, Pal.lancerLaser, 10 * Vars.state.rules.unitDamageMultiplier,
			unit.x + unit.vel.x, unit.y + unit.vel.y, unit.rotation, 14);
	},

	draw(unit) {
		const scl = unit.power / 2;
		if (scl < 0.01) return;

		Draw.color(Pal.lancerLaser);
		Draw.alpha(scl);
		Draw.blend(Blending.additive);
		Draw.rect(mess.shieldRegion, unit.x + Mathf.range(scl), unit.y + Mathf.range(scl), unit.rotation - 90);
		Draw.blend();
		Draw.color();
	}
});

// Make it work for saves
EntityMapping.nameMap.put("anuke-logic-messenger", mess.constructor);
for (var i in EntityMapping.idMap) {
	if (!EntityMapping.idMap[i]) {
		EntityMapping.idMap[i] = mess.constructor;
		mess.classId = i;
		break;
	}
}

if (mess.classId == -1) {
	throw "Messenger has no class ID";
}

module.exports = mess;
