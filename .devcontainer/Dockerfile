# Base image: Node + common dev tools
FROM node:24-bookworm

# 1. Install core OS packages for agent file searching
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    curl \
    ca-certificates \
    git \
    ripgrep \
    fd-find \
    unzip \
    tmux \
    && rm -rf /var/lib/apt/lists/*

# 2. Setup Directories & Permissions
RUN mkdir -p /home/node/workspace \
    && chown -R node:node /home/node

# 3. Install Agent CLI tools globally AS ROOT
# Root has the correct permissions to write to /usr/local/bin
RUN npm install -g opencode-ai@latest 

# 4. Give 'node' user ownership of global node_modules and bin for easy updates
RUN chown -R node:node /usr/local/lib/node_modules /usr/local/bin

# 5. Switch to the non-root 'node' user for container runtime
USER node

WORKDIR /home/node/workspace