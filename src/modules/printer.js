import mixin from "../mixin";
import axios from "axios";

import { ToastProgrammatic as Toast } from "buefy";

const deliveredStorageKey = "printer-delivered-job-ids";
function deliveredIds() {
  try {
    const value = JSON.parse(window.storage.getItem(deliveredStorageKey) || "[]");
    return Array.isArray(value) ? value : [];
  } catch (error) { return []; }
}
function saveDelivered(state) {
  try { window.storage.setItem(deliveredStorageKey, JSON.stringify(state.deliveredJobIds)); }
  catch (error) { /* Keep the in-memory journal when storage is unavailable. */ }
}
function sameJob(left, right) {
  return left === right || (left.pk != null && left.pk === right.pk);
}

export default {
  namespaced: true,
  // -----------------------------------------------------------------
  state: {
    printerModuleBaseURL: 'http://localhost:38627/',
    machineId: null,
    cloudPrinters: [],
    localPrinters: [],
    printerLoading: true, // loading mode
    printerDiscoveryError: null,
    queue: [],
    ongoingJobs: [], // Jobs that are now being processed
    done: [],
    failedJobs: [],
    deliveredJobIds: deliveredIds(),
    lastCloudJobs: [],
    isRunningJobs: false,

    isDeletePrinterModalActive: false,
    isEditPrinterModalActive: false,
    isNewPrinterModalActive: false,

    printTemplateDatas: []
  },
  // -----------------------------------------------------------------
  getters: {
    printTemplateDatas: (state) => state.printTemplateDatas,
    printerModuleBaseURL: state => {
      return state.printerModuleBaseURL
    },
    machineId: state => {
      return state.machineId;
    },
    cloudPrinters: state => {
      return state.cloudPrinters;
    },
    localPrinters: state => {
      return state.localPrinters;
    },
    printerLoading: state => {
      return state.printerLoading;
    },
    queue: state => {
      return state.queue;
    },
    ongoingJobs: state => {
      return state.ongoingJobs;
    },
  },
  // -----------------------------------------------------------------
  mutations: {
    addPrintTemplateData(state, newData) {
      state.printTemplateDatas.unshift(newData)
    },
    removePrintTemplateData(state, newData) {
      state.printTemplateDatas.splice(state.printTemplateDatas.indexOf(newData), 1)
    },
    setMachineId(state, newData) {
      state.machineId = newData;
    },
    setCloudPrinters(state, newData) {
      state.cloudPrinters = newData || [];
    },
    setLocalPrinters(state, newData) {
      state.localPrinters = newData || [];
    },
    setPrinterLoading(state, newData) {
      state.printerLoading = newData;
    },
    addPrinter(state, newData) {
      state.cloudPrinters.push(newData)
    },
    deletePrinter(state, data) {
      state.cloudPrinters = state.cloudPrinters.filter(cloudPrinter => cloudPrinter.pk != data)
    },
    editPrinter(state, newData) {
      state.cloudPrinters = state.cloudPrinters.filter(cloudPrinter => cloudPrinter.pk != newData.pk)
      state.cloudPrinters.push(newData)
    }
  },
  // -----------------------------------------------------------------
  actions: {
    /* Local Printes

			* payload: { username, password }
			* API response: { machineId , printers: [ { printer } ] }
		*/
    /* Local Printes

			* payload: null
			* API response: { machineId , printers: [ { printer } ] }
		*/
    async getLocalPrinters(context) {
      context.state.printerLoading = true;
      context.state.printerDiscoveryError = null;
      try {
        const data = window.isElectron ? await window.getPrinterList()
          : (await axios.create({ baseURL: context.getters.printerModuleBaseURL, timeout: 10000 })
            .request({ url: "printer-list/", method: "GET" })).data;
        context.commit("setMachineId", data.machineId);
        context.commit("setLocalPrinters", data.printers);
        context.dispatch("handleCloudPrintJobs", context.state.lastCloudJobs);
        return true;
      } catch (error) {
        context.state.printerDiscoveryError = "ارتباط با سرویس چاپگر برقرار نشد. برنامه چاپگر را اجرا کنید و دوباره تلاش کنید.";
        return false;
      } finally {
        context.commit("setPrinterLoading", false);
      }
    },
    async runJobs(context) {
      const state = context.state;
      if (state.isRunningJobs) return;
      state.isRunningJobs = true;
      try {
        while (state.queue.length) {
          const job = state.queue.pop();
          state.ongoingJobs.push(job);
          try {
            if (!job.delivered && !state.deliveredJobIds.includes(job.pk)) {
              let printed;
              if (window.isElectron) {
                printed = job.raw_data === "test"
                  ? await window.printTest(job.printer.name, job.printer.width)
                  : await window.posPrint(job.printer.name, job.raw_data);
              } else {
                const device = encodeURIComponent(job.printer.name);
                const response = await axios.create({
                  baseURL: context.getters.printerModuleBaseURL, timeout: 30000
                }).request(job.raw_data === "test" ? {
                  url: "print-sample/" + device + "/?size=" + encodeURIComponent(job.printer.width), method: "GET"
                } : {
                  url: "print/" + device + "/", method: "POST", data: { htmlContent: job.raw_data }
                });
                printed = response.data.status;
              }
              if (!printed) throw new Error("Printer did not confirm delivery");
              job.delivered = true;
              if (job.pk != null && !state.deliveredJobIds.includes(job.pk)) {
                state.deliveredJobIds.push(job.pk);
                saveDelivered(state);
              }
            } else {
              job.delivered = true;
            }
            // A failed acknowledgement must never print the same job again.
            const data = { raw_data: job.raw_data, description: job.description, is_done: true };
            await mixin.methods.request({
              url: job.pk != null ? "api/v1/printer-job/" + job.pk + "/"
                : "api/v1/printer/" + job.printer.pk + "/job/create/",
              method: job.pk != null ? "PUT" : "POST", data, noLoadingNeeded: true
            });
            job.is_done = true;
            state.done.unshift(job);
            state.done.splice(200);
            state.deliveredJobIds = state.deliveredJobIds.filter(id => id !== job.pk);
            saveDelivered(state);
          } catch (error) {
            job.failureStage = job.delivered ? "acknowledgement" : "delivery";
            if (!state.failedJobs.some(failed => sameJob(failed, job))) state.failedJobs.push(job);
            Toast.open({ queue: false, type: "is-danger", message: job.delivered
              ? "چاپ انجام شد؛ ثبت نتیجه در سرور انجام نشد. از تنظیمات چاپگر دوباره تلاش کنید"
              : "چاپ انجام نشد. چاپگر را بررسی کنید و از تنظیمات چاپگر دوباره تلاش کنید" });
          } finally {
            state.ongoingJobs = state.ongoingJobs.filter(ongoing => !sameJob(ongoing, job));
          }
        }
      } finally {
        state.isRunningJobs = false;
      }
    },
    retryFailedJobs(context) {
      const failed = context.state.failedJobs.splice(0);
      return context.dispatch("handlePrintJobs", failed);
    },
    handlePrintJobs(context, jobs) {
      const state = context.state;
      (jobs || []).forEach(job => {
        const known = state.queue.concat(state.ongoingJobs, state.done, state.failedJobs);
        if (!known.some(existing => sameJob(existing, job))) state.queue.unshift(job);
      });
      return context.dispatch("runJobs");
    },
    handleCloudPrintJobs(context, groups) {
      context.state.lastCloudJobs = groups || [];
      if (!context.state.machineId) return;
      const jobs = [];
      context.state.lastCloudJobs.forEach(group => {
        if (group.uid === context.state.machineId) jobs.push(...group.jobs);
      });
      return context.dispatch("handlePrintJobs", jobs);
    },
    addPrinter(context, payload) {
      mixin.methods
        .request({
          method: "POST",
          url: "api/v1/cafe/" + context.rootState.accountModule.activeCafe.id + "/printer/add/",
          data: payload
        })
        .then(res => {
          context.state.isNewPrinterModalActive = false
          context.commit('addPrinter', res.data)
        })
        .catch(err => {
          context.rootState.errors = (err.response && err.response.data) || { detail: ["خطا در ارتباط با سرور"] };
          Toast.open({
            queue: false,
            message: "مشکلی در ساخت پرینتر جدید ایجاد شد",
            type: "is-danger"
          });
        });
    },
    deletePrinter(context, payload) {
      mixin.methods
        .request({
          method: "DELETE",
          url: "api/v1/printer/" + payload + "/"
        })
        .then(res => {
          context.state.isDeletePrinterModalActive = false
          context.commit('deletePrinter', payload)
        })
        .catch(err => {
          context.state.isDeletePrinterModalActive = false
          Toast.open({
            queue: false,
            message: "مشکلی در حذف پرینتر به وجود آمد. لطفا مجددا تلاش کنید",
            type: "is-danger"
          });
        });
    },
    editPrinter(context, payload) {
      mixin.methods
        .request({
          method: "PATCH",
          url: "api/v1/printer/" + payload.pk + "/",
          data: payload
        })
        .then(res => {
          context.state.isEditPrinterModalActive = false
          context.commit('editPrinter', res.data)
        })
        .catch(err => {
          context.state.isEditPrinterModalActive = false
          Toast.open({
            queue: false,
            message: "مشکلی در ویرایش پرینتر به وجود آمد. لطفا مجددا تلاش کنید",
            type: "is-danger"
          });
        });
    },
    setPrinterPolicy(context, {printer, policy}) {
      mixin.methods
        .request({
          method: "PATCH",
          url: "api/v1/printer/" + printer.pk + "/",
          data: {
            policy: policy
          }
        })
        .then(res => {
          context.commit('editPrinter', res.data)
        })
        .catch(err => {
          Toast.open({
            queue: false,
            message: "مشکلی در ویرایش پرینتر به وجود آمد. لطفا مجددا تلاش کنید",
            type: "is-danger"
          });
        });
    }
  }
};