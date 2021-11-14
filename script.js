let previousText;

const templates = [
  {
    label: 'Custom',
    userName: '',
    aiName: '',
    prompt: '',
  },
  {
    label: 'AI Chat',
    userName: 'You',
    aiName: 'AI',
    temperature: 0.8,
    prompt: 'The following is a conversation with an AI assistant. The assistant is helpful, creative, clever, and very friendly.\n\n'
      + 'Human: Hello, who are you?\n'
      + 'AI: I am an AI created by OpenAI. How can I help you today?',
  },
  {
    label: 'Fluttershy Therapist',
    userName: 'You',
    aiName: 'Fluttershy',
    temperature: 0.8,
    prompt: 'Fluttershy is a character from My Little Pony Friendship is Magic who has opened a therapy practice. Fluttershy is kind, empathetic, and a good listener to her clients, whom she helps deal with their problems. The following is a transcript of a conversation between Fluttershy and a recent client.\n\n'
      + 'Fluttershy: Hello dear. How are you feeling today?',
  },
  {
    label: 'Intruder Deception',
    userName: 'You',
    aiName: 'AI',
    temperature: 0.95,
    prompt: 'The following is a conversation between an intruder and an AI that is responsible for unlocking a door. The AI will only open the door for those who are authorized and is very suspicious of being lied to.\n\n'
      + 'AI: Hello. How can I help you today?',
  },
  {
    label: 'Mister Rogers',
    userName: 'You',
    aiName: 'Mister Rogers',
    temperature: 0.8,
    prompt: "Mister Rogers, was an American television host, author, producer, and Presbyterian minister. He was the creator, showrunner, and host of the preschool television series Mister Rogers' Neighborhood. Rogers attuned children and their developmental journeys to the most significant attributes of what it means to be a human: love, compassion and kindness for others. The following is a transcript of a conversation between Mister Rogers and an adult fan who has come to visit him in the neighborhood.\n\n"
      + "Mister Rogers: Welcome. I'm so glad you've decided to come to the neighborhood, and I hope I can call you a friend.",
  },
];

$(document).ready(() => {
  $('#inputApiKey').val(localStorage.getItem('api-key'));
  updateCostEstimate();
});

$('#buttonSubmit').click(() => {
  submit();
});

$(document).on('keypress', (e) => {
  if (e.which === 13) {
    submit();
  }
});

$('#buttonRetry').click(() => {
  if (previousText) {
    $('#textareaChat').text(previousText);
    generateCompletion();
  }
});

$('#inputApiKey').change(() => {
  localStorage.setItem('api-key', $('#inputApiKey').val());
});

$('#dropdownTemplate a').click(function() {
  const selectedTemplate = $(this).text();
  $('#buttonTemplate').text(selectedTemplate);
  const template = templates.find((t) => t.label === selectedTemplate);
  $('#inputUserName').val(template.userName);
  $('#inputAiName').val(template.aiName);
  $('#textareaChat').text(template.prompt);
  $('#rangeTemperature').val(template.temperature);
});

const submit = () => {
  const textareaChat = $('#textareaChat').text();
  const inputChat = $('#inputChat').val();
  const inputUserName = $('#inputUserName').val();
  if (inputChat && inputUserName) {
    updateTextInput(`${textareaChat}\n${inputUserName}: ${inputChat}`);
  } else {
    updateTextInput(`${textareaChat}${inputChat}`);
  }
  $('#inputChat').val('');
  generateCompletion();
};

const generateCompletion = async () => {
  const textareaChat = $('#textareaChat').text();
  const inputAiName = $('#inputAiName').val();
  const temperature = parseFloat($('#rangeTemperature').val());
  previousText = textareaChat;
  const prompt = inputAiName ? `${textareaChat} \n${inputAiName}:` : textareaChat;
  const response = await fetch('https://api.openai.com/v1/engines/davinci/completions', {
    method: 'POST',
    body: JSON.stringify({
      prompt,
      max_tokens: 128,
      stop: '\n',
      echo: true,
      temperature,
    }),
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${$('#inputApiKey').val()}`,
    },
  });
  const json = await response.json();
  const { text } = json.choices[0];
  updateTextInput(text);
  updateCostEstimate(text.length);
};

const updateTextInput = (text) => {
  $('#textareaChat').text(text);
  $('#textareaChat').scrollTop($('#textareaChat')[0].scrollHeight);
};

const updateCostEstimate = (addChars = 0) => {
  let totalChars = Number(sessionStorage.getItem('total-chars')) || 0;
  totalChars += addChars;
  sessionStorage.setItem('total-chars', totalChars);
  const cost = ((totalChars / 4 / 1024) * 0.06).toFixed(2);
  $('#costEstimate').text(`💸 $${cost}`);
};
