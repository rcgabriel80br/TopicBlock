export class RuleEngine {
    constructor() {
        this.rules = [];
    }
    add(rule) {
        this.rules.push(rule);
    }
    getRules() {
        return this.rules;
    }
}