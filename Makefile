format:
	npx prettier --write "src/**/*.{js,jsx,ts,tsx,css,json}"
	npx eslint --fix "src/**/*.{js,jsx,ts,tsx}" --rule "import/order: error" --rule "unused-imports/no-unused-imports: error"