import api from "./api";

const ADMIN_REMINDERS_ENDPOINT = "/admin/reminders";
const ADMIN_PATIENTS_ENDPOINT = "/admin/patients";

export const getAdminReminders = (params = {}) =>
  api.get(ADMIN_REMINDERS_ENDPOINT, {
    params,
  });

export const getReminderPatients = (params = {}) =>
  api.get(ADMIN_PATIENTS_ENDPOINT, {
    params,
  });

export const createAdminReminder = (payload) =>
  api.post(ADMIN_REMINDERS_ENDPOINT, payload);

export const updateAdminReminder = (
  reminderId,
  payload
) =>
  api.put(
    `${ADMIN_REMINDERS_ENDPOINT}/${reminderId}`,
    payload
  );

export const updateAdminReminderStatus = (
  reminderId,
  isActive
) =>
  api.patch(
    `${ADMIN_REMINDERS_ENDPOINT}/${reminderId}/status`,
    {
      is_active: isActive,
    }
  );

export const deleteAdminReminder = (reminderId) =>
  api.delete(
    `${ADMIN_REMINDERS_ENDPOINT}/${reminderId}`
  );

const extractArray = (response, possibleKeys = []) => {
  const payload = response?.data;

  const possibleLists = [
    payload?.data?.items,
    ...possibleKeys.map(
      (key) => payload?.data?.[key]
    ),
    payload?.items,
    ...possibleKeys.map((key) => payload?.[key]),
    payload?.data,
    payload,
  ];

  return (
    possibleLists.find((item) =>
      Array.isArray(item)
    ) || []
  );
};

export const extractReminders = (response) =>
  extractArray(response, ["reminders"]);

export const extractPatients = (response) =>
  extractArray(response, ["patients"]);

export const extractReminder = (response) => {
  const payload = response?.data;

  return (
    payload?.data?.reminder ||
    payload?.reminder ||
    payload?.data ||
    payload ||
    null
  );
};