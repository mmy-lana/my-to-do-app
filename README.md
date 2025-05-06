
# My To-Do App

A simple and lightweight To-Do application built with **Svelte** that allows you to add, edit, delete, and track your tasks. The app supports tasks for today, tomorrow, and future tasks. It also provides features like checking/unchecking tasks and saving tasks in the local storage.

## Features

- Add tasks with a specific due date (Today, Tomorrow, or Future).
- Toggle tasks as completed (check/uncheck).
- Delete tasks.
- Local storage support to save tasks.
- Task categorization by date (Today, Tomorrow, Future, Past).

## Demo

You can view the live demo of the application at [https://your-deployed-app-url](https://your-deployed-app-url).

## Installation

To run this app locally, follow the steps below:

### Prerequisites

Make sure you have the following installed:

- **Node.js** (version >= 16)
- **npm** (Node package manager)

### Steps

1. **Clone the repository:**

   ```bash
   git clone https://github.com/mmy-lana/my-to-do-app.git
   ```

2. **Navigate to the project folder:**

   ```bash
   cd my-to-do-app
   ```

3. **Install the dependencies:**

   ```bash
   npm install
   ```

4. **Run the app locally:**

   ```bash
   npm run dev
   ```

   After running the command, open [http://localhost:5000](http://localhost:5000) in your browser to view the app.

## Usage

1. **Add a Task:** Enter a task in the input field and select a due date (Today, Tomorrow, or Future). Click the "Add" button or press `Enter` to add the task.

2. **Toggle Task Completion:** Click the checkbox next to a task to mark it as completed or incomplete.

3. **Delete a Task:** Click the delete button to remove a task from the list.

4. **Tasks Overview:** Tasks are categorized into:
   - **Past Tasks:** Tasks that have a due date before today.
   - **Today:** Tasks due today.
   - **Tomorrow:** Tasks due tomorrow.
   - **Upcoming:** Tasks due in the future.

## Deployment

This app can be deployed to various platforms. Here are some deployment options:

### Deploy to Vercel

1. Create a Vercel account at [https://vercel.com/signup](https://vercel.com/signup).
2. Link your GitHub account and select the repository containing this project.
3. Vercel will automatically detect that it's a Svelte app and configure the build settings for you.
4. Click "Deploy" and your app will be live.

### Deploy to Netlify

1. Create a Netlify account at [https://www.netlify.com/signup](https://www.netlify.com/signup).
2. Connect your GitHub repository to Netlify.
3. Netlify will automatically detect the framework (Svelte) and deploy the app.

### Deploy to GitHub Pages

1. Build the app using `npm run build`.
2. Push the build output (usually inside the `public/` folder) to a `gh-pages` branch.
3. Enable GitHub Pages in the repository settings.

## Contributing

If you would like to contribute to the project, please fork the repository and submit a pull request. All contributions are welcome!

### Steps to Contribute

1. Fork this repository.
2. Clone your forked repository:
   ```bash
   git clone https://github.com/your-username/my-to-do-app.git
   ```
3. Create a new branch:
   ```bash
   git checkout -b feature-name
   ```
4. Make your changes.
5. Commit your changes:
   ```bash
   git commit -am 'Add new feature'
   ```
6. Push to the branch:
   ```bash
   git push origin feature-name
   ```
7. Submit a pull request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with **Svelte**, a modern JavaScript framework.
- Powered by **localStorage** to store tasks persistently across sessions.