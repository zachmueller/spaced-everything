import { TFile, App } from 'obsidian';

export class FrontmatterQueue {
    private queue: Map<string, Record<string, any>> = new Map();
    private app: App;

    constructor(app: App) {
        this.app = app;
    }

    add(file: TFile, updates: Record<string, any>) {
        const path = file.path;
        if (!this.queue.has(path)) {
            this.queue.set(path, {});
        }
        const fileUpdates = this.queue.get(path)!;
        Object.assign(fileUpdates, updates);
    }

    async process() {
        for (const [path, updates] of this.queue) {
            const file = this.app.vault.getAbstractFileByPath(path);
            if (file instanceof TFile) {
                await this.updateFrontmatter(file, updates);
            }
        }
        this.queue.clear();
    }

    private async updateFrontmatter(file: TFile, updates: Record<string, any>) {
        return new Promise<void>((resolve) => {
            this.app.fileManager.processFrontMatter(file, (frontmatter) => {
                Object.entries(updates).forEach(([key, value]) => {
                    if (value === undefined) {
                        delete frontmatter[key];
                    } else {
                        frontmatter[key] = value;
                    }
                });
                resolve();
            });
        });
    }
}