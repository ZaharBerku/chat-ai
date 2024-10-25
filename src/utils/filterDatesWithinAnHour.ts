import { isJsonString } from "@/utils/isJsonString";

const filterDatesWithinAnHour = (dataArray: any) => {
  const now = new Date();

  return dataArray.filter((item: any) => {
    if (item.role === "item" || !isJsonString(item.content)) {
      return true;
    }
    const { data } = JSON.parse(item.content);
    if (data) {
      const itemDate = new Date(data.date);
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      return itemDate > oneHourAgo;
    } else {
      return false;
    }
  });
};

export { filterDatesWithinAnHour };
