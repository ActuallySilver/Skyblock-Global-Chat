import {
    @ButtonProperty,
    @CheckboxProperty,
    @ColorProperty,
    @PercentSliderProperty,
    @SelectorProperty,
    @SwitchProperty,
    @TextProperty,
    @SliderProperty,
    @Vigilant,
} from "Vigilance";

@Vigilant("Skyblock-Global-Chat", "Skyblock Global Chat", {
    getCategoryComparator: () => (a, b) => {
        const categories = ["General"]; // This is the category order
        return categories.indexOf(a.name) - categories.indexOf(b.name);
    }
})

class settings {
    constructor() {
        this.initialize(this);

        this.setCategoryDescription("General", "General Category description")

    }

    // General settings
    @SwitchProperty({
        name: "Enable Auto-connect",
        description: "Automaticly connects to the chat.",
        category: "General",
        subcategory: "Auto-connect"
    })
    enableAutoconnect = true;
}

export default new settings();