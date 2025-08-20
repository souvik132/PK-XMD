const { cmd } = require('../command');

cmd({
    pattern: "obfuscate",
    alias: ["obf", "securejs"],
    desc: "Obfuscate JavaScript code",
    category: "utility",
    use: '.obfuscate <your js code> OR reply to a code message',
    filename: __filename
},
async (conn, mek, m, { from, reply, quoted, args }) => {
    try {
        // Load obfuscator package
        let JavaScriptObfuscator;
        try {
            JavaScriptObfuscator = require('javascript-obfuscator');
        } catch (e) {
            return reply(
                "❌ Package not installed!\n\n" +
                "Run this command to install:\n" +
                "```bash\nnpm install javascript-obfuscator\n```" +
                "\nThen restart your bot."
            );
        }

        // Check source code (either reply OR inline args)
        const originalCode = 
            quoted?.text || 
            quoted?.message?.conversation || 
            quoted?.message?.extendedTextMessage?.text || 
            (args.length > 0 ? args.join(" ") : null);

        if (!originalCode) {
            return reply("❌ Please reply to a JavaScript code OR provide code after `.obfuscate`");
        }

        // Obfuscation options (high security)
        const obfuscationOptions = {
            compact: true,
            controlFlowFlattening: true,
            controlFlowFlatteningThreshold: 0.75,
            numbersToExpressions: true,
            simplify: true,
            shuffleStringArray: true,
            splitStrings: true,
            stringArrayThreshold: 0.8,
            rotateStringArray: true,
            deadCodeInjection: true,
            deadCodeInjectionThreshold: 0.4,
            identifierNamesGenerator: 'hexadecimal',
            selfDefending: true,
            disableConsoleOutput: false,
            debugProtection: false,
            debugProtectionInterval: false,
            transformObjectKeys: true,
            unicodeEscapeSequence: true
        };

        // Run obfuscation
        const obfuscatedResult = JavaScriptObfuscator.obfuscate(originalCode, obfuscationOptions);
        const obfuscatedCode = obfuscatedResult.getObfuscatedCode();

        // Preview comparison
        const comparison = `
📜 *ORIGINAL CODE (${formatBytes(originalCode.length)}):*
\`\`\`javascript
${truncate(originalCode, 200)}
\`\`\`

🔒 *OBFUSCATED CODE (${formatBytes(obfuscatedCode.length)}):*
\`\`\`javascript
${truncate(obfuscatedCode, 300)}
\`\`\`

✅ Obfuscation complete! Sending secured code file...
`.trim();

        await reply(comparison);

        // Send full file
        await conn.sendMessage(
            from,
            {
                document: Buffer.from(obfuscatedCode),
                fileName: 'secured_code.js',
                mimetype: 'application/javascript',
                caption: `🔒 Secured JavaScript Code | Obfuscated by PK-XMD`
            },
            { quoted: mek }
        );

    } catch (e) {
        console.error("Obfuscation Error:", e);
        reply(`❌ Obfuscation failed: ${e.message}`);
    }
});

// Helper function to truncate long text
function truncate(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...\n\n⚠️ TRUNCATED - DOWNLOAD FULL FILE BELOW';
}

// Helper function to format bytes
function formatBytes(bytes) {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + ' ' + sizes[i];
}
