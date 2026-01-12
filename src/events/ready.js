export default {
  name: 'ready',
  once: true,
  async execute(client) {
    console.log(`✅ Ready! Logged in as ${client.user.tag}`);
    // expose client
    globalThis.__client = client;
  }
};
