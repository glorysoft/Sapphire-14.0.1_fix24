using System;
using AdvantShop.Core;
using AdvantShop.Core.Services.Crm;
using AdvantShop.Core.Services.Crm.ProjectStatuses;
using AdvantShop.Core.Services.Localization;
using AdvantShop.Customers;
using AdvantShop.Web.Admin.Models.Tasks;
using AdvantShop.Web.Infrastructure.Handlers;

namespace AdvantShop.Web.Admin.Handlers.Tasks
{
    public class CopyTaskHandler : ICommandHandler<TaskCopyResult>
    {
        private readonly int _id;

        public CopyTaskHandler(int id)
        {
            _id = id;
        }

        public TaskCopyResult Execute()
        {
            var manager = ManagerService.GetManager(CustomerContext.CustomerId);
            if (manager == null)
                throw new BlException(LocalizationService.GetResource("Admin.Tasks.AddTask.NoManager"));
            
            var model = new TaskCopyResult();

            var task = TaskService.GetTask(_id);
            if (task == null)
                return model;

            if (!TaskService.CheckAccess(task))
                return model;
            
            var taskCopy = task.DeepClone();

            taskCopy.Name += " - Копия";
            taskCopy.DueDate = null;
            
            taskCopy.AppointedManagerId = manager.ManagerId;
            taskCopy.DateAppointed = DateTime.Now;
            
            taskCopy.DateCreated = DateTime.Now;
            taskCopy.DateModified = DateTime.Now;

            taskCopy.StatusId = ProjectStatusService.GetFirstStatusIdInList(taskCopy.TaskGroupId);
            
            taskCopy.SetManagerIds(task.ManagerIds);

            TaskService.AddTask(taskCopy);

            model.Result = true;
            model.TaskId = taskCopy.Id;

            return model;
        }
    }
}
