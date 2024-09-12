function getRank(userLevel) {
    const ranks = [
      { level: 60, rank: "Full-Stack" },
      { level: 55, rank: "Confirmed" },
      { level: 50, rank: "Junior" },
      { level: 40, rank: "Basic" },
      { level: 30, rank: "Assistant" },
      { level: 20, rank: "Apprentice" },
      { level: 10, rank: "Beginner" },
      { level: 0, rank: "Aspiring" },
    ];
  
    for (let i = 0; i < ranks.length; i++) {
      if (userLevel >= ranks[i].level) {
        return ranks[i].rank;
      }
    }
  }
  
  /* function cleanTopSkillDublicates(data) {
    const dataArray = data.data.transaction;
    const highest = {};
    // Find the highest amount for each skill type
    dataArray.forEach((obj) => {
      if (!highest[obj.type] || obj.amount > highest[obj.type].amount) {
        highest[obj.type] = obj;
      }
    });
    // Convert the object to an array and sort by amount in descending order
    // Slice keep only the top 5
    const uniqueData = Object.values(highest)
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
    return uniqueData;
  }*/
  
  function transformSkillTypes(dataArray) {
    const skillMap = {
      go: "GoLang",
      js: "Javascript",
      html: "Html",
      css: "Css",
      docker: "Docker",
      algo: "Algorithms",
      "front-end": "Frontend",
      "back-end": "Backend",
      stats: "Statistics",
      game: "Game",
    };
  
    return dataArray.map((obj) => {
      const formatted = obj.type.slice(6); // Remove the "skill_"
      return {
        ...obj,
        type: skillMap[formatted] || formatted, // Replace with the mapped value or keep original
      };
    });
  }
  