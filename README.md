# Unraid API

This module adds the ability to access your unraid Server directly from nodejs.
It works via SSH so it could be compatible with our Linux Distros but the main focus is on Unraid.

### How to use

First of all you have to provide you SSH Credentials via your environment. You can find all needed env vars in the .env.example file:

```env
SSH_HOST=tower.local
SSH_USER=root
SSH_PASSWORD=hunter2
SSH_PORT=22
```

The variables should be pretty self explanatory.
