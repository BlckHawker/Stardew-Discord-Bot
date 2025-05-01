//helper script/function that automatically registers slash commands without kicking the bot out
(async () => {
    try {
        console.log('Registering slash commands...');
        console.log('Finished registering slash commands');
    } catch (error) {
        console.log(`There was an error in registeringCommands.js: ${error}`);
    }
})();