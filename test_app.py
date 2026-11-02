import unittest

from app import ABILITY_TIER_COSTS, SOUL_THRESHOLDS, app, build_levels


class BoonPickerTests(unittest.TestCase):
    def setUp(self):
        self.client = app.test_client()

    def test_thresholds_cover_start_and_maximum(self):
        self.assertEqual(len(SOUL_THRESHOLDS), 36)
        self.assertEqual(SOUL_THRESHOLDS[0], 600)
        self.assertEqual(SOUL_THRESHOLDS[-1], 49200)
        self.assertTrue(all(left < right for left, right in zip(SOUL_THRESHOLDS, SOUL_THRESHOLDS[1:])))

    def test_ability_tier_costs_are_incremental(self):
        self.assertEqual(ABILITY_TIER_COSTS, (1, 2, 5))

    def test_levels_include_cost_and_reward_data(self):
        levels = build_levels()
        self.assertEqual(levels[0]["reward"], "Ability unlock")
        self.assertEqual(levels[1]["cost"], 200)
        self.assertEqual(levels[2]["reward"], "Ability unlock")
        self.assertEqual(levels[4]["reward"], "Ability unlock")
        self.assertEqual(levels[7]["reward"], "Ability unlock")
        self.assertEqual(levels[1]["reward"], "Ability point")
        self.assertEqual(levels[-1]["souls"], 49200)

    def test_picker_and_api_are_available(self):
        page = self.client.get("/")
        api = self.client.get("/api/levels")
        self.assertEqual(page.status_code, 200)
        self.assertIn(b"TOTAL SOULS REQUIRED", page.data)
        self.assertIn(b"UNSPENT AP", page.data)
        self.assertIn(b"GAIN LEVEL", page.data)
        self.assertNotIn(b"UNSPENT UNLOCKS", page.data)
        self.assertIn(b'id="maxLevelButton"', page.data)
        self.assertIn(b'id="gainLevelButton">', page.data)
        self.assertEqual(api.status_code, 200)
        self.assertEqual(len(api.get_json()), 36)
        self.assertEqual(api.get_json()[-1]["souls"], 49200)


if __name__ == "__main__":
    unittest.main()
