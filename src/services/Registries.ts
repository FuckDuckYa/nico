import {
	EventMeta,
	Events,
	PluginMeta,
	RawEventMeta
} from "@core/structure/Types";
import md from "./Reflector";
import { _handleCogs, _handleInjector } from "~/core/Decorators";

export namespace Registries {
	export type MetadataMap = {
		// @sector plugins
		PluginMeta: PluginMeta;
		PluginCogs: string[];

		// @sector "events"
		EventMeta: RawEventMeta | EventMeta;
	};
	export type MetadataArrayMap = {
		PluginInjector: string;

		EventKeys: string;
	};
	export type MetadataObjectMap = {
		PluginDecArgs:
			| {
					transformer: (...arg) => any;
					args: any[];
			  }
			| undefined;
	};

	export const Loaders = {
		1 /* version */: async function loader(
			entry: (client, cm) => Promise<void>,
			{ name, client }
		) {
			try {
				await entry(client, client.manager);
			} catch (e) {
				logger.error(e);
				logger.log(3, `Launching plugin ${name} fail: ${e.message}`);
			}
		},
		2: function loader(
			plugin,
			{
				name,
				path,
				cog = false
			}: { name: string; path: string; cog: boolean }
		): string[] | -1 /* loaded cogs */ {
			let cogs;
			const meta = md.get(plugin, "PluginMeta");
			if (!meta) throw new Error("Plugin is not a plugin!");
			const inst = new plugin();
			_handleInjector(inst);
			if (!cog) {
				let _cog = _handleCogs(inst, path, name);
				if ((_cog as any).error) {
					logger.error((_cog as any).error);
					_cog = [];
				}
				cogs = _cog;
			}
			const handlers: {
				[K in keyof Events]?: EventMeta<K>[];
			} = {};
			for (let name of Object.getOwnPropertyNames(plugin.prototype)) {
				if (
					name == "constructor" ||
					typeof plugin.prototype[name] !== "function"
				)
					continue;

				const fn = plugin.prototype[name];
				const data = md.get(fn, "EventMeta") as EventMeta;
				if (!data) continue;
				if (!Object.hasOwn(handlers, data.__type__))
					handlers[data.__type__] = [];
				handlers[data.__type__]!.push({
					...data,
					__type__: data.__type__,
					from: plugin.name,
					at: name,
					handler: fn.bind(inst),
					args: md.get(inst, "PluginDecArgs")?.[name] || undefined
				});
			}
			if (!meta)
				return (
					void console.log(
						`${name} isnt a vaild plugin, rejecting.`
					) ?? -1
				);
			(Object.values(handlers) as unknown as EventMeta[]).map((pr: any) =>
				pr.map(pr =>
					storage.client.manager.register({
						...pr,
						handler: pr.handler
					})
				)
			);
			return cogs;
		}
	};
}
