.PHONY: install build clean dev package

# Variables
DIST_DIR = dist
NODE_MODULES = node_modules

# Install npm dependencies
install:
	@echo "Installing dependencies..."
	npm install

# Build the extension
build: clean
	@echo "Building extension..."
	npm run build
	@echo "Copying manifest and static assets..."
	@mkdir -p $(DIST_DIR)
	@cp manifest.json $(DIST_DIR)/
	@mkdir -p $(DIST_DIR)/icons
	@if [ -d public/icons ] && [ "$$(ls -A public/icons 2>/dev/null)" ]; then \
		cp public/icons/* $(DIST_DIR)/icons/ 2>/dev/null || true; \
	fi
	@mkdir -p $(DIST_DIR)/styles
	@if [ -f src/styles/overlay.css ]; then cp src/styles/overlay.css $(DIST_DIR)/styles/; fi
	@echo "Build complete!"

# Clean build artifacts
clean:
	@echo "Cleaning build artifacts..."
	@rm -rf $(DIST_DIR)
	@echo "Clean complete!"

# Development watch mode (Vite only - rebuilds on file changes)
# Note: Run 'make build' first to create dist/ with manifest and assets
dev:
	@echo "Starting development watch mode..."
	@echo "Note: Make sure you've run 'make build' first to create dist/ folder"
	npm run dev

# Development with auto-reload (requires web-ext)
# This will: 1) build the extension, 2) open Firefox, 3) auto-reload on changes
# Usage: make dev-reload
dev-reload: build
	@echo "Starting development with auto-reload..."
	@echo "Firefox will open automatically. The extension will reload when dist/ files change."
	@echo "Press Ctrl+C to stop"
	@npx web-ext run \
		--source-dir=$(DIST_DIR) \
		--firefox-profile=./.web-ext-profile \
		--profile-create-if-missing \
		--devtools \
		--ignore-files=node_modules/** src/** *.zip .git/**

# Create distributable package
package: build
	@echo "Creating distributable package..."
	@cd $(DIST_DIR) && zip -r ../rsvp-reader.zip .
	@echo "Package created: rsvp-reader.zip"
