"""
extensions
"""
import json


class Extensions:
    def __init__(self):
        self.main_cog = "main"
        self.events_cog = "events"
        self.game_cog = "game"
        self.load_extensions()

    def load_extensions(self):
        self.load_main_cog()
        self.load_events_cog()
        self.load_game_cog()

    def load_main_cog(self):
        with open("data/extensions.json") as file:
            data = json.load(file)
            self.main_cog = data[self.main_cog]

    def load_events_cog(self):
        with open("data/extensions.json") as file:
            data = json.load(file)
            self.events_cog = data[self.events_cog]

    def load_game_cog(self):
        with open("data/extensions.json") as file:
            data = json.load(file)
            self.game_cog = data[self.game_cog]

    def get_main_cog(self):
        return self.main_cog

    def get_events_cog(self):
        return self.events_cog

    def get_game_cog(self):
        return self.game_cog

    def get_all_extensions(self):
        return [self.get_main_cog(), self.get_events_cog(), self.get_game_cog()]
