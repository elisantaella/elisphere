// constants.js - Game constants and strategy definitions

// Game state management
const GameState = {
    MAIN_MENU: 'main_menu',
    LOBBY: 'lobby',
    GAMEPLAY: 'gameplay'
  };
  
  // Define the happiness strategies and their US history connections
  const happinessStrategies = [
    {
      name: "Gratitude",
      description: "Practicing appreciation for what we have",
      historicalConnection: "Thanksgiving and its Evolution",
      historicalContext: "From the first feast between Pilgrims and Wampanoag in 1621 to Lincoln's proclamation making it a national holiday during the Civil War in 1863, Thanksgiving embodies the American tradition of expressing gratitude even during difficult times.",
      implementation: "Keep a daily gratitude journal listing three things you're thankful for, just as Americans have gathered to express thanks through various national hardships.",
      character: "Benjamin Franklin",
      dialogues: [
        "Welcome to the Gratitude Garden! I'm Benjamin Franklin.",
        "Did you know I kept a journal where I tracked my virtues? Gratitude was essential to my practice.",
        "Just as Americans gathered for thanksgiving meals during the Civil War, finding reasons for gratitude amid struggle can strengthen our resolve.",
        "Try my daily gratitude practice: each morning, list three things you're thankful for. It's simple but powerful!"
      ]
    },
    {
      name: "Mindfulness",
      description: "Being fully present in the moment",
      historicalConnection: "Transcendentalism Movement (1830s-1850s)",
      historicalContext: "Led by Ralph Waldo Emerson and Henry David Thoreau, this movement emphasized self-reliance, intuition, and deep connection with nature. Thoreau's experiment at Walden Pond was an early American example of mindful living.",
      implementation: "Spend 10 minutes daily in mindful observation of nature, following Thoreau's example of deliberate awareness.",
      character: "Henry David Thoreau",
      dialogues: [
        "Welcome to Walden Woods! I'm Henry David Thoreau.",
        "I came to these woods to live deliberately, to front only the essential facts of life.",
        "The Transcendentalist movement taught Americans to find truth through observation and intuition rather than established doctrine.",
        "Try my mindfulness practice: spend 10 minutes daily observing nature without judgment, just as I did at Walden Pond."
      ]
    },
    {
      name: "Social Connection",
      description: "Building positive relationships with others",
      historicalConnection: "Barn Raising Tradition (18th-19th century)",
      historicalContext: "American frontier communities came together to help neighbors build barns in a single day, embodying the values of mutual aid and community solidarity that helped early settlers survive.",
      implementation: "Volunteer monthly for a community project and have weekly meaningful conversations with friends or family.",
      character: "Laura Ingalls Wilder",
      dialogues: [
        "Welcome to the Community Square! I'm Laura Ingalls Wilder.",
        "On the American frontier, no family could survive alone. Barn raisings brought everyone together, combining work with celebration.",
        "These community gatherings weren't just practical—they created bonds that sustained people through harsh winters and difficult times.",
        "Try my connection practice: volunteer for a community project monthly and have one deep conversation weekly."
      ]
    },
    {
      name: "Acts of Kindness",
      description: "Doing good deeds for others without expectation",
      historicalConnection: "Settlement House Movement (1880s-1920s)",
      historicalContext: "Led by reformers like Jane Addams at Hull House, this movement provided social services, education, and community support for urban immigrants and the poor during the Progressive Era.",
      implementation: "Perform one random act of kindness daily and organize a monthly community service project.",
      character: "Jane Addams",
      dialogues: [
        "Welcome to Hull House! I'm Jane Addams.",
        "During the rapid industrialization of America, many immigrants faced terrible conditions. The Settlement House Movement showed how kindness could transform communities.",
        "We didn't just provide services—we created spaces where people from different backgrounds could connect and help each other.",
        "Try my kindness practice: do one small act of kindness daily, and organize something larger monthly."
      ]
    },
    {
      name: "Goal Setting",
      description: "Setting and working toward meaningful objectives",
      historicalConnection: "Apollo Space Program (1960s)",
      historicalContext: "President Kennedy's ambitious goal to reach the moon by the end of the 1960s unified Americans around a common purpose and demonstrated the power of setting challenging, specific goals.",
      implementation: "Set one major monthly goal and track progress with weekly milestones, inspired by NASA's mission planning approach.",
      character: "John F. Kennedy",
      dialogues: [
        "Welcome to the Moonshot Center! I'm President Kennedy.",
        "We choose to go to the moon not because it is easy, but because it is hard. This challenge organized the best of America's energies and skills.",
        "The Apollo program showed how a clear, ambitious goal could unite a nation and inspire extraordinary achievement.",
        "Try my goal-setting practice: set one major monthly goal with weekly milestones, just as NASA broke down the moonshot into achievable steps."
      ]
    }
  ];
  
  // Export for module use
  if (typeof module !== 'undefined') {
    module.exports = {
      GameState,
      happinessStrategies
    };
  } else {
    // For browser use, add to window
    window.GameState = GameState;
    window.happinessStrategies = happinessStrategies;
  }