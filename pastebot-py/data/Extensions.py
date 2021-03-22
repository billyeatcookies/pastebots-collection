"""
extensions
"""
import json


class Extensions:
    def __init__(self):
        self.events_cog = "events"
        self.paste_cog = "paste"
        self.load_extensions()

    def load_extensions(self):
        self.load_events_cog()
        self.load_paste_cog()

    def load_events_cog(self):
        with open("data/extensions.json") as file:
            data = json.load(file)
            self.events_cog = data[self.events_cog]

    def load_paste_cog(self):
        with open("data/extensions.json") as file:
            data = json.load(file)
            self.paste_cog = data[self.paste_cog]

    def get_events_cog(self):
        return self.events_cog

    def get_paste_cog(self):
        return self.paste_cog

    def get_all_extensions(self):
        return [self.get_events_cog(), self.get_paste_cog()]
