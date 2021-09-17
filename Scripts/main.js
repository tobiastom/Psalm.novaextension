var langserver = null;

exports.activate = function() {
	langserver = new PsalmLanguageServer();
};

exports.deactivate = function() {
	if (langserver) {
		langserver.deactivate();
		langserver = null;
	}
};

class PsalmLanguageServer {
	languageClient = null;
	configuration = {};

	constructor() {
		nova.config.observe("name.tobiastom.psalm.path", this.pathDidChange, this);
		nova.config.observe(
			"name.tobiastom.psalm.config",
			this.configDidChange,
			this
		);
	}

	get path() {
		return this.absolutePath(
			this.configuration.path || "./vendor/bin/psalm-language-server"
		);
	}

	get config() {
		return this.absolutePath(this.configuration.config || "./psalm.xml");
	}

	pathDidChange(path) {
		this.configuration.path = path;
		this.start();
	}

	configDidChange(config) {
		this.configuration.config = config;
		this.start();
	}

	absolutePath(path) {
		if (path.startsWith("./") || !path.startsWith("/")) {
			path = nova.path.join(nova.workspace.path, path.substr(2));
		}

		return path;
	}

	deactivate() {
		this.stop();
	}

	start() {
		console.log("sdsd");
		if (this.languageClient) {
			this.languageClient.stop();
			nova.subscriptions.remove(this.languageClient);
		}

		var client = new LanguageClient(
			"name.tobiastom.psalm",
			"Psalm",
			{
				path: this.path,
				args: ["--config", this.config],
			},
			{
				syntaxes: ["php"],
			}
		);

		try {
			client.start();

			nova.subscriptions.add(client);
			this.languageClient = client;
		} catch (error) {
			nova.workspace.showErrorMessage(error.toString());
		}
	}

	stop() {
		if (this.languageClient) {
			this.languageClient.stop();
			nova.subscriptions.remove(this.languageClient);
			this.languageClient = null;
		}
	}
}
