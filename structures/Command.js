const { Permissions } = require("discord.js");
const path = require("path");

class Command {
  constructor(client, file, options) {
    this.name = options.name || file.name;
    this.client = client;
    this.file = file;
    this.description = options.description || "No Description Provided.";
    this.ownerOnly = options.ownerOnly || false;
    this.aliases = options.aliases || [];
    this.cooldown = options.cooldown || 0;
    // File path is like general/ping.js we split by / and take general title-cased if not provided.
    this.category = options.category || this.client.utils.toProperCase(file.path.split(path.sep)[0]) || "General";
    this.guildOnly = options.guildOnly || false;
    this.hidden = options.hidden || false;
    this.enabled = typeof options.enabled !== "undefined" ? options.enabled : true;
    this.usage = options.usage || "No Usage Provided.";
    this.botPermissions = new Permissions(options.botPermissions || []).freeze();
    this.userPermissions = new Permissions(options.userPermissions || []).freeze();
    this.store = this.client.commands;
  }

  async _run(ctx, args) {
    try {
      const results = await this.before(ctx, args);
      if(results === true) await this.run(ctx, args);
      if(typeof results === "string" && results !== "") return ctx.reply(results);
    } catch(err) {
      this.client.emit("commandError", ctx, err);
    }
  }

  /**
   * Verifies that a user is given.
   */
  async verifyUser(ctx, user, defaultToAuthor = false) {
    if(!user && defaultToAuthor) return ctx.author;
    if(!user) throw "What do you expect me to do without a user mention or an ID?";
    const match = /^(?:<@!?)?(\d{17,19})>?$/.exec(user);
    if(!match) throw "Baka! That's not a user mention or an ID. What were you trying to do?";
    user = await this.client.users.fetch(match[1]).catch(() => null);
    // We will assume they gave IDs as mentions are highly unlikely to fail.
    if(!user) throw "I couldn't find that user! Make sure the ID is correct.";
    return user;
  }

  /**
   * Verifies that a member is given.
   */
  async verifyMember(ctx, member, defaultToAuthor = false) {
    const user = await this.verifyUser(ctx, member, defaultToAuthor);
    return ctx.guild.members.fetch(user);
  }

  /**
   * Executed before the command is ran.
   * The return value can be either true/false or a string.
   * Incase of false the command won't run.
   * Incase of string the command won't run but the string is sent to the channel.
   * Incase of true the command is ran as normal.
   */
  async before(ctx, args) {
    return true;
  }

  /**
   * The actual command implementation, must be implemented in a subclass.
   */
  async run(ctx, args) {
    return ctx.reply(`${this.constructor.name} does not provide a \`run()\` implementation.${msg.author.id !== this.client.constants.ownerID ? " This is a bug, please report this in our server at https://discord.gg/mDkMbEh" : ""}`);
  }

  reload() {
    return this.store.load(this.file.path);
  }

  enable() {
    this.enabled = true;
    return this;
  }

  disable() {
    this.enabled = false;
    return this;
  }
}

module.exports = Command;