const taskInput = document.querySelector('.inp-text');
const addButton = document.querySelector('.btn');
const taskList = document.querySelector('.list-of-todos');
lightModeIcon = document.createElement('i');
darkModeIcon = document.createElement('i');
lightModeIcon.classList.add('fas', 'fa-moon');
darkModeIcon.classList.add('fas', 'fa-sun');
const toggleButton = createButton('Toggle Display', 'btn', () => {
  if (document.body.classList.contains('dark-mode')) {
    document.body.classList.remove('dark-mode');
    localStorage.setItem('dark-mode', 'disabled');
    toggleButton.textContent = '';
    toggleButton.appendChild(lightModeIcon);
    removeDarkModeFromAll();
  } else {
    document.body.classList.add('dark-mode');
    localStorage.setItem('dark-mode', 'enabled');
    toggleButton.textContent = '';
    toggleButton.appendChild(darkModeIcon);
    addDarkModeToAll();
  }
});

toggleButton.classList.add('toggle-dark-mode-btn');
document.querySelector('section.input-todo').appendChild(toggleButton);


function createButton(text, className, onClickHandler) {
  const button = document.createElement('button');
  button.textContent = text;
  button.classList.add(className);
  button.addEventListener('click', onClickHandler);
  return button;
}

checkDarkMode();

function showToast(message, state, task, duration = 750) {

  const toast = document.getElementById('toast');
  toast.classList.remove('success');
  toast.classList.remove('info');
  toast.classList.remove('error');

  // إزالة أي زر Undo موجود من الـ toast إذا كان موجودًا
  const existingUndoButton = toast.querySelector('.undo-btn');
  if (existingUndoButton) {
    existingUndoButton.remove();
  }

  toast.textContent = message;

  // إضافة الحالة الخاصة بالتوست
  toast.classList.remove('hidden');
  toast.classList.add('visible');
  toast.classList.add(state);

  // في حالة أن الحالة هي "info" فقط نقوم بإضافة زر Undo
  if (state === 'info' && task) {
    const undoButton = createButton('Undo', 'undo-btn', () => {
      undoDelete(task);
      // إخفاء التوست يدويًا بعد الضغط على Undo
      toast.classList.remove('visible');
      toast.classList.add('hidden');
      clearTimeout(toastTimeout);
    });
    toast.appendChild(undoButton);
  }
  toastTimeout = setTimeout(() => {
    // إخفاء التوست بعد المدة المحددة فقط إذا لم يتم التفاعل مع Undo
    if (!toast.classList.contains('hidden')) {
      toast.classList.remove('visible');
      toast.classList.add('hidden');
    }
  }, duration);
}



let tasksCount = 0;

function checkTasks() {
  if (tasksCount === 0) {
    taskList.parentElement.classList.add('hidden');
  } else {
    taskList.parentElement.classList.remove('hidden');
  }
}

checkTasks();

function addTask(event) {
  if (event) {
    event.preventDefault();
  }

  const taskText = taskInput.value.trim();
  if (taskText === '') {
    showToast('Please enter a valid task!', 'error')
    checkTasks();
    return;
  }


  const task = document.createElement('li');
  const btnsContainer = document.createElement('div');
  const delBtn = createButton('DEL', 'delete-btn', () => deleteTask(task));
  const editBtn = createButton('EDIT', 'edit-btn', () => editTask(task, btnsContainer));


  btnsContainer.classList.add('btns');
  btnsContainer.appendChild(delBtn);
  btnsContainer.appendChild(editBtn);
  task.classList.add('task');
  task.textContent = taskText;
  task.appendChild(btnsContainer);
  taskList.appendChild(task);

  tasksCount++;
  taskInput.value = '';

  checkTasks();
}


function deleteTask(task) {
  task.classList.add('removed');
  setTimeout(() => {
    if (!task.classList.contains('removed')) {  // إذا كانت المهمة قد تم استعادتها (تم الضغط على Undo)
      return; // لا نقوم بحذفها
    }
    taskList.removeChild(task); // حذف المهمة إذا لم يتم الضغط على Undo
  }, 2000);
  showToast('Task deleted! Click to undo', 'info', task, 3000);
  tasksCount--;
  checkTasks();
}


function undoDelete(task) {
  task.classList.remove('removed');
  taskList.appendChild(task); // إعادة إضافة المهمة

  // إخفاء التوست فورًا بعد الضغط على Undo، دون الحاجة للانتظار
  const toast = document.getElementById('toast');
  toast.classList.remove('visible');
  toast.classList.add('hidden');

  // عرض رسالة استعادة المهمة
  showToast('Task restored!', 'success', null, 1500);
  tasksCount++;
  checkTasks();
}




function editTask(task, btnsContainer) {
  task.classList.add('editing')
  task.removeChild(btnsContainer);
  const currentText = task.textContent;
  task.textContent = '';
  const inp = document.createElement('input');
  inp.type = 'text';
  inp.value = currentText;
  inp.classList.add('edit-inp');
  task.appendChild(inp);
  setTimeout(() => inp.focus(), 0);
  inp.addEventListener('input', (e) => {
    newVal = e.target.value;
    if (newVal.trim() === '' || newVal.trim() === currentText) {
      saveButton.disabled = true;
    } else {
      saveButton.disabled = false;
    }
  });


  inp.addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
      if (inp.value === '') {
        showToast('Please Enter A Valid Task!', 'error')
        saveButton.disabled = true
        return;
      }
      if (inp.value === currentText) {
        showToast('Please update your Task!', 'error')
        saveButton.disabled = true

        return;
      }
      showToast('Task Updated Successfully!', 'success');
      task.textContent = inp.value;
      task.appendChild(btnsContainer);
      task.classList.remove('editing');
    }
  });

  const saveButton = createButton('Save', 'save-btn', function () {
    if (inp.value === '') {
      showToast('Updated Task Must NOT Be Empty!', 'error')
      saveButton.disabled = true

      return;
    }
    showToast('Task Updated Successfully!', 'success');
    task.textContent = inp.value;
    task.appendChild(btnsContainer);
    task.classList.remove('editing');

  })
  task.appendChild(saveButton);


}

addButton.addEventListener('click', () => {
  if (taskInput.value.trim() === '') {
    showToast('Please enter a valid task!', 'error');
  } else {
    addTask();
    showToast('Task added successfully!', 'success');
  }
});

taskInput.addEventListener('keydown', function (event) {
  if (event.key === 'Enter') {
    event.preventDefault();
    if (taskInput.value.trim() === '') {
      showToast('Please enter a valid task!', 'error');
    } else {
      addTask();
      showToast('Task added successfully!', 'success');
    }
  }
});

function checkDarkMode() {
  if (localStorage.getItem('dark-mode') === 'enabled') {
    document.body.classList.add('dark-mode');
    toggleButton.classList.add('dark-mode');
    toggleButton.textContent = '';
    toggleButton.appendChild(darkModeIcon);
    addDarkModeToAll();
  } else {
    document.body.classList.remove('dark-mode');
    toggleButton.classList.remove('dark-mode');
    toggleButton.textContent = '';
    toggleButton.appendChild(lightModeIcon);
    removeDarkModeFromAll();
  }
}
function addDarkModeToAll() {
  // إضافة dark-mode لجميع العناصر المحددة مثل الأزرار، التوست، الخ
  const elementsToDarkMode = document.querySelectorAll('.toast, .edit-btn, .delete-btn, .save-btn, button, section, h1, .form label');
  elementsToDarkMode.forEach(element => element.classList.add('dark-mode'));
}

// إزالة فئة dark-mode من جميع العناصر
function removeDarkModeFromAll() {
  // إزالة dark-mode لجميع العناصر المحددة
  const elementsToLightMode = document.querySelectorAll('.toast, .edit-btn, .delete-btn, .save-btn, button, section, h1, .form label');
  elementsToLightMode.forEach(element => element.classList.remove('dark-mode'));
}

