export const toCamelCase = (sentence: string): string =>{
    // Split the sentence into words
    const words = sentence.split(' ');
  
    // Convert the first word to lowercase
    const camelCaseWords = [words[0].toLowerCase()];
  
    // Capitalize the first letter of each subsequent word
    for (let i = 1; i < words.length; i++) {
      const word = words[i];
      camelCaseWords.push(word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
    }
  
    // Join the words together to form the camel case variable name
    return camelCaseWords.join('');
}