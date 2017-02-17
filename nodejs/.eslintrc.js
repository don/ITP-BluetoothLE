module.exports = {
    "env": {
        "node": true
    },
    "extends": "eslint:recommended",
    "rules": {
        "indent": [
            "error",
            4
        ],
        "linebreak-style": [
            "error",
            "unix"
        ],
        "quotes": [
            "error",
            "single"
        ],
        "semi": [
            "error",
            "always"
        ],
        "no-console": "off",
        "no-undef": 1,
        "no-unused-vars": [
            "warn", { "argsIgnorePattern": "^error$|^isNotification$" }
        ]

    }
};
