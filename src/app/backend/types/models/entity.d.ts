import { AppointmentState } from "@/generated/prisma/enums";
import { Prisma } from "@/lib/prisma";

type ISODate = `${number}-${number}-${number}` | null;
type ISOTime = `${number}:${number}` | null;

type GetSession = Prisma.SessionGetPayload<{
  select: {
    id: number;
    name: string;
    identificacion: string;
    email: string;
  };
}>;

type ReturnSession = Prisma.SessionGetPayload<{
  select: {
    id: number;
    name: string;
    identificacion: string;
    email: string;
    role: string;
    credentials: {
      select: {
        password: string;
      };
    };
  };
}>;

type ReturnUser = Prisma.SessionGetPayload<{
  select: {
    id: number;
    name: string;
    identificacion: string;
    email: string;
    role: string;
  };
}>;

type GetCredentials = Prisma.SessionGetPayload<{
  select: {
    id: number;
    credentials: {
      select: {
        password: string;
      };
    };
  };
}>;

type GetClient = Prisma.ClientGetPayload<{
  select: {
    id: true;
    fullName: true;
    fullSurname: true;
    identified: true;
    clientState: true;
    clientContact: {
      select: {
        phoneNumber: true;
        email: true;
        address: true;
      };
    };
    clientVehicle: {
      select: {
        brand: true;
        model: true;
        year: true;
        plates: true;
        engineDisplacement: true;
        description: true;
      };
    };
  };
}>;

type UpdateClient = Record<{
  clientState: boolean;
  phoneNumber: string;
  email: string;
  address: string;
  description?: string;
}>;

type CreateClient = {
  fullName: string;
  fullSurname: string;
  identified: string;
  clientContact: {
    phoneNumber: string;
    email: string;
    address?: string;
  };
  clientVehicle?: [
    {
      brand: string;
      model: string;
      year: number;
      plates: string;
      engineDisplacement: number;
      description?: string;
    }
  ];
};

type GetVehicleClient = Prisma.ClientVehicleGetPayload<{
  select: {
    id: true;
    brand: true;
    model: true;
    year: true;
    plates: true;
    engineDisplacement: true;
    description: true;
  };
}>;

type CreateVehicle = {
  clientId: number;
  brand: string;
  model: year;
  year: number;
  plates: string;
  engineDisplacement: number;
  description?: string;
};

export type UpdateVehicle = Partial<{
  brand: string;
  model: string;
  year: number;
  engineDisplacement: number;
  description: string;
}>;

type CreateAppointment = {
  clientId: number;
  employedId?: number;
  appointmentDate: Date;
  ubicacion: string;
  details?: string;
};

type GetAppointment = Prisma.AppointmentSchedulingGetPayload<{
  select: {
    id: true;
    appointmentDate: true;
    ubicacion: true;
    appointmentState: true;
    details: true;
    author: {
      select: {
        id: true;
        fullName: true;
        fullSurname: true;
        identified: true;
      };
    };
    employedAuthor: {
      select: {
        id: true;
        name: true;
        identificacion: true;
        role: true;
      };
    };
  };
}>;

type UpdateAppointment = {
  employedId: number;
  ubicacion: string;
  appointmentState: AppointmentState;
  details?: string;
  time?: {
    appointmentDate: ISODate | null;
    appointmentTime: ISOTime | null;
  };
};

type InvoiceCreate = {
  clientId: number;
  description?: string;
  service:
  | {
    id: number;
    serviceExtra: Prisma.Decimal;
  }[]
  | null;
  pieces:
  | {
    id: number;
    amount: number;
    pieceExtra: Prisma.Decimal;
  }[]
  | null;
};

type GetInvoice = Prisma.InvoiceGetPayload<{
  include: {
    author: {
      select: {
        fullName: true;
        fullSurname: true;
      };
    };
    invoiceDetail: {
      select: {
        amount: true;
        subtotal: true;
        pieceExtra: true;
        serviceExtra: true;
        description: true;
        pieces: {
          select: {
            name: true;
            price: true;
          };
        };
        purchasedService: {
          select: {
            name: true;
            price: true;
          };
        };
      };
    };
  };
}>;

type GetInvoiceClient = Prisma.InvoiceGetPayload<{
  select: {
    id: true,
    total: true,
    createAt: true,
    author: {
      select: {
        fullName: true,
        fullSurname: true,
        identified: true,
        clientContact: {
          select: {
            email: true,
          }
        }
      }
    },
    invoiceDetail: {
      select: {
        amount: true,
        subtotal: true,
        pieceExtra: true,
        serviceExtra: true,
        description: true,
        pieces: {
          select: {
            name: true,
            description: true,
            price: true,
          }
        },
        purchasedService: {
          select: {
            name: true,
            description: true,
            price: true,
            guarantee: true,
          }
        }
      }
    }
  }
}>

type GetClientInvoiceById = Prisma.ClientGetPayload<{
  select: {
    id: true;
    fullName: true;
    fullSurname: true;
    identified: true;
    clientContact: {
      select: {
        phoneNumber: true;
        email: true;
      };
    };
    clientInvoice: {
      select: {
        total: true;
        createAt: true;
        invoiceDetail: {
          select: {
            amount: true;
            subtotal: true;
            pieceExtra: true;
            serviceExtra: true;
            extra: true;
            description: true;
            pieces: {
              select: {
                name: true;
                price: true;
              };
            };
            purchasedService: {
              select: {
                name: true;
                price: true;
              };
            };
          };
        };
      };
    };
  };
}>;

type GetInvoiceById = Prisma.InvoiceGetPayload<{
  select: {
    id: true,
    total: true,
    createAt: true,
    author: {
      select: {
        fullName: true,
        fullSurname: true,
        identified: true,
        clientContact: {
          select: {
            email: true,
          }
        }
      }
    },
    invoiceDetail: {
      select: {
        amount: true,
        subtotal: true,
        pieceExtra: true,
        serviceExtra: true,
        description: true,
        pieces: {
          select: {
            name: true,
            description: true,
            price: true,
          }
        },
        purchasedService: {
          select: {
            name: true,
            description: true,
            price: true,
            guarantee: true,
          }
        }
      }
    }
  }
}>;

type UpdateInvoiceDetails = {
  detailId: number;  // ✅ Agregado tipo number
  amount?: number;
  description?: string;
  services?: {
    id: number;
    serviceExtra?: number;  // ✅ Agregado para extras del servicio
  } | null;
  pieces?: {
    id: number;
    amount?: number;  // ✅ Agregado para cantidad de piezas
    pieceExtra?: number;  // ✅ Agregado para extras de piezas
  } | null;
};

type InvoiceDetailInput = {
  amount?: number;
  subtotal: Prisma.Decimal;
  description?: string;
  pieceExtra?: Prisma.Decimal;
  serviceExtra?: Prisma.Decimal;
  piece?: { connect: { id: number } };
  service?: { connect: { id: number } };
};

type GetServices = Prisma.ServicesGetPayload<{
  select: {
    id: true;
    name: true;
    description: true;
    price: true;
    guarantee: true;
    createAt: true;
    author: {
      select: {
        name: true;
      };
    };
    serviceImage: {
      select: {
        id: true,
        imageUrl: true,
        description: true
      }
    }
  };
}>;

type GetServiceImages = Prisma.ServiceImagesGetPayload<{
  select: {
    serviceImage: {
      select: {
        id: true,
        imageUrl: true,
        publicId: true,
        description: true,
        servicesAuthor: {
          select: {
            id: true
          }
        }
      }
    }
  }
}>

type UpdateServicesImages = {
  image?: File;
  description?: string;
}

type GetServiceCategory = Prisma.ServiceCategoryGetPayload<{
  select: {
    id: true;
    name: true;
    description: true;
    createAt: true;
  };
}>;

export interface ServiceCategory {
  id: number;
  name: string;
  description: string;
  createAt: Date;
  services?: Services[];
}

type GetPieces = Prisma.PiecesGetPayload<{
  select: {
    id: true;
    name: true;
    description: true;
    price: true;
    estado: true;
    stock: true;
    brand_piece: true;
    createAt: true;
    pieceCategory: {
      select: {
        name: true;
      };
    };
  };
}>;

type GetPiecesImages = Prisma.PiecesImageGetPayload<{
  select: {
    id: true,
    imageUrl: true,
    description: true,
    checkListAuthor: {
      select: {
        id: true,
      }
    }
  }
}>

export interface ModifyCategory {
  name: string;
  description: string;
}

export interface PieceCategory {
  id: number;
  name: string;
  description: string;
  createAt: Date;
  pieces?: Pieces[];
}

export interface Suppliers {
  id: number;
  name: string;
  state: StateSuppliers;
  payCondition: string;
  createAt: Date;
  updatedAt: Date;
  suppliersContact?: SuppliersContact;
  suppliersType?: SuppliersType[];
  suppliersUbication?: SuppliersUbication[];
}

export interface SuppliersUbication {
  id: number;
  country: string;
  city: string;
  region: string;
  proveedorId: number;
  author: Suppliers;
}

export interface SuppliersContact {
  id: number;
  direction: string;
  phoneNumber: string;
  email: string;
  proveedorId: number;
  author: Suppliers;
}

export interface SuppliersType {
  id: number;
  type: TypeSuppliers;
  proveedorId: number;
  author: Suppliers;
}

export interface LogApp {
  id: number;
  typeChange: TypeChange;
  origin: string;
  title: string;
  message?: string;
  data: unknown;
}

type CreateChecklist = {
  checkType: string;
  fuelLevel: number;
  mileage: string;
  generalNotes: string;
  technicianName: string;
  appointmentId: number;
  imageUrl
};

type CreateChecklistItem = {
  label: string;
  category: string;
  checked: boolean;
  condition?: string;
  notes?: string;
  checklistId: number;
};

type GetChecklist = Prisma.VehicleChecklistGetPayload<{
  select: {
    id: true;
    checkType: true;
    fuelLevel: true;
    mileage: true;
    generalNotes: true;
    technicianName: true;
    completedAt: true;
    appointment: {
      select: {
        id: true;
        appointmentDate: true;
        ubicacion: true;
        author: {
          select: {
            id: true;
            fullName: true;
            fullSurname: true;
            identified: true;
          };
        };
      };
    };
    items: {
      select: {
        id: true;
        label: true;
        category: true;
        checked: true;
        condition: true;
        notes: true;
      };
    };
    vehicleImage: {
      select: {
        id: true;
        imageUrl: true;
        description: true;
      }
    }
  };
}>;

type GetVehicleImages = Prisma.VehicleImageGetPayload<{
  select: {
    id: true,
    imageUrl: true,
    description: true,
    checkListAuthor: {
      select: {
        id: true,
      }
    }
  }
}>

type GetChecklistItem = Prisma.ChecklistItemGetPayload<{
  select: {
    id: true;
    label: true;
    category: true;
    checked: true;
    condition: true;
    notes: true;
    checklistId: true;
  };
}>;

type UpdateChecklist = Partial<{
  checkType: string;
  fuelLevel: number;
  mileage: string;
  generalNotes?: string;
  technicianName: string;
  appointmentId: number;
}>;

type UpdateChecklistItem = Partial<{
  label: string;
  category: string;
  checked: boolean;
  condition?: string;
  notes?: string;
  checklistId: number;
}>;
