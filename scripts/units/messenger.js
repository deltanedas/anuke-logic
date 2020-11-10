/* Old v5 javelin repurposed as a logic-only unit. */

const mess = extendContent(UnitType, "messenger", {
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
		this.drawOcclusion(unit);

		Draw.z(z - UnitType.outlineSpace);
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
	drawCell() {}, drawItems() {}
});

Blocks.airFactory.plans.add(new UnitFactory.UnitPlan(mess, 25 * 60,
	ItemStack.with(Items.silicon, 30, Items.titanium, 20)));

// Disable AI
mess.defaultController = () => new LogicAI();
mess.speed = 1.87;
mess.drag = 0.01;
mess.health = 170;
mess.flying = true;
mess.canBoost = true;
mess.health = 170;
mess.itemCapacity = 200;

mess.constructor = () => extend(UnitEntity, {
	isGrounded() {
		return this.dead && this.super$isGrounded();
	},

	setStats() {
		this.super$setStats();
		this.stats.add(Stat.canBoost, true);
	},

	speed() {
		return this.power > 0.03 ? (this.power < 0.95 ? 0.5 + this.power : (this.power + 1) * 15) : mess.speed;
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

	// Translated from zenith mass
	mass: () => 502,

	warp() {
		return Mathf.clamp(this.vel.len(), 1, (this.power + 1) * 5);
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
		if (unit.isPlayer() ? unit.controller.boosting : unit.controller.boost) {
			unit.power = Mathf.lerp(unit.power, 1, 0.02);
			if (Vars.ui && Mathf.chance(unit.power / 15)) {
				Fx.lancerLaserCharge.at(unit);
			}
		} else {
			// Cut the engines immediately
			if (unit.power > 0.95) unit.power = 0.95;
			unit.power = Mathf.lerp(unit.power, 0, unit.power * 0.05);
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

module.exports = mess;
