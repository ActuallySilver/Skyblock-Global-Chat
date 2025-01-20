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

        // Here dependencies could be added 
        // this.addDependency("Setting1", "Setting2");


        // Here category descriptions could be added
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

    // more settings could be here
}

export default new settings();