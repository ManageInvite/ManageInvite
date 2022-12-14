const Command = require("../../structures/Command.js"),
    Discord = require("discord.js");
const { Constants: { ApplicationCommandOptionTypes } } = require("discord.js");

module.exports = class extends Command {
    constructor (client) {
        super(client, {
            name: "invites",
            enabled: true,
            aliases: [ "invite", "rank" ],
            clientPermissions: [ "EMBED_LINKS" ],
            permLevel: 0,

            slashCommandOptions: {
                description: "Get user invites",
                
                options: [
                    {
                        type: ApplicationCommandOptionTypes.USER,
                        name: "user",
                        description: "User to get invites of (default is you)"
                    }
                ]
            }
        });
    }

    async runInteraction (interaction, data) {
        const blacklistedUsers = await this.client.database.fetchGuildBlacklistedUsers(interaction.guild.id);
        if (blacklistedUsers.includes(interaction.user.id)) {
            return interaction.reply({ content: interaction.guild.translate("admin/blacklist:AUTHOR_BLACKLISTED"), ephemeral: true });
        }

        const user = interaction.options.getUser("user") || interaction.user;
        const memberData = await this.client.database.fetchGuildMember({
            storageID: interaction.guild.settings.storageID,
            userID: user.id,
            guildID: interaction.guild.id
        });

        const translation = {
            username: user.username,
            inviteCount: memberData.invites,
            regularCount: memberData.regular,
            bonusCount: memberData.bonus,
            fakeCount: memberData.fake > 0 ? `-${memberData.fake}` : memberData.fake,
            leavesCount: memberData.leaves > 0 ? `-${memberData.leaves}` : memberData.leaves
        };

        const description = user.id === interaction.user.id ?
            interaction.guild.translate("core/invite:AUTHOR_CONTENT", translation) :
            interaction.guild.translate("core/invite:MEMBER_CONTENT", translation);


        const embed = new Discord.MessageEmbed()
            .setAuthor({
                name: user.tag,
                iconURL: user.displayAvatarURL()
            })
            .setDescription(description)
            .setColor(data.color)
            .setFooter({ text: data.footer });

        interaction.reply({ embeds: [embed] });
    }

};
